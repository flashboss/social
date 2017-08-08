package org.exoplatform.social.core.jpa.updater;

import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.exception.CustomChangeException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.resource.ResourceAccessor;
import org.exoplatform.commons.utils.CommonsUtils;
import org.exoplatform.commons.utils.ListAccess;
import org.exoplatform.container.ExoContainerContext;
import org.exoplatform.container.PortalContainer;
import org.exoplatform.container.component.RequestLifeCycle;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.organization.Group;
import org.exoplatform.services.organization.Membership;
import org.exoplatform.services.organization.MembershipTypeHandler;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.social.core.space.SpaceUtils;
import org.exoplatform.social.core.space.model.Space;
import org.exoplatform.social.core.space.spi.SpaceService;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class AnyMembershipMigration implements CustomTaskChange {
  private static final Log LOG = ExoLogger.getLogger(AnyMembershipMigration.class);

  private final int BUFFER = 50;

  private final int THREAD = 10;

  private ExecutorService pool = Executors.newFixedThreadPool(THREAD);

  @Override
  public void execute(Database database) throws CustomChangeException {
    // start the migration
    LOG.info("=== Start Social Membership * migration");
    long startTime = System.currentTimeMillis();

    try {
      Future<int[]> result = pool.submit(migrate());
      int[] report = result.get();

      LOG.info("=== End Social Membership * {} memberships migrated successfully, {} errors, in {} miliseconds",
          report[0], report[1], System.currentTimeMillis() - startTime);
    } catch (Exception ex) {
      LOG.error("error during migrate social membership *", ex);
      throw new CustomChangeException(ex);
    }
  }

  private Callable<int[]> migrate() {
    return new Callable<int[]>() {
      @Override
      public int[] call() throws Exception {
        try {
          int count = 0;
          int error = 0;
          Collection<Group> groups = getAllGroup();

          List<Future<int[]>> results = new ArrayList<>();
          for (Group group : groups) {
            if (group.getId().startsWith(SpaceUtils.SPACE_GROUP)) {
              //
              results.add(pool.submit(migrateGroup(group)));
            }
          }

          for (Future<int[]> result : results) {
            int[] r = result.get(10, TimeUnit.MINUTES);
            count += r[0];
            error += r[1];
          }

          return new int[]{count, error};
        } catch (Exception ex) {
          LOG.error("error during migrate memberships", ex);
          throw new CustomChangeException(ex);
        }
      }
    };
  }

  private Callable<int[]> migrateGroup(Group group) {
    return new Callable<int[]>() {
      @Override
      public int[] call() throws Exception {
        int count = 0;
        int error = 0;
        SpaceService spaceService = CommonsUtils.getService(SpaceService.class);

        Space space = getSpaceByGroup(group);
        if (space == null) {
          LOG.info("ignore {} group, no space found", group.getId());
          return new int[] {0, 0};
        }

        //
        LOG.info("Migrating group {}", group.getId());

        ListAccess<Membership> memberships = getMembershipByGroup(group);
        int size = memberships.getSize();
        //
        int fromId = 0;
        int pageSize = size > BUFFER ? BUFFER : size;

        while (pageSize > 0) {
          try {
            RequestLifeCycle.begin(PortalContainer.getInstance());

            for (Membership m : memberships.load(fromId, pageSize)) {
              if (MembershipTypeHandler.ANY_MEMBERSHIP_TYPE.equalsIgnoreCase(m.getMembershipType())) {
                LOG.info("Start migrating {}", m.toString());
                String username = m.getUserName();

                if (!spaceService.isManager(space, username)) {
                  if (!spaceService.isMember(space, username)) {
                    spaceService.addMember(space, username);
                  }
                  spaceService.setManager(space, username, true);
                  count++;
                }
              }
            }
          } catch (Exception e) {
            error++;
            LOG.error("error during migrate membership at index {}, page {}", fromId, pageSize);
            throw e;
          } finally {
            RequestLifeCycle.end();
            LOG.info("finish migrating in thread {}", Thread.currentThread().getId());
          }

          fromId += pageSize;
          pageSize = size - fromId;
          pageSize = pageSize > BUFFER ? BUFFER : pageSize;
        }

        return new int[] {count, error};
      }
    };
  }

  private ListAccess<Membership> getMembershipByGroup(Group group) throws Exception {
    try {
      RequestLifeCycle.begin(PortalContainer.getInstance());
      //
      OrganizationService orgService = CommonsUtils.getService(OrganizationService.class);

      ListAccess<Membership> memberships = orgService.getMembershipHandler().findAllMembershipsByGroup(group);
      LOG.info("There are {} memberships", memberships.getSize());

      return memberships;
    } finally {
      RequestLifeCycle.end();
    }
  }

  private Space getSpaceByGroup(Group group) {
    try {
      RequestLifeCycle.begin(PortalContainer.getInstance());
      //
      SpaceService spaceService = CommonsUtils.getService(SpaceService.class);
      Space space = spaceService.getSpaceByGroupId(group.getId());
      return space;
    } finally {
      RequestLifeCycle.end();
    }
  }

  private Collection<Group> getAllGroup() throws Exception {
    try {
      RequestLifeCycle.begin(PortalContainer.getInstance());
      //
      OrganizationService orgService = CommonsUtils.getService(OrganizationService.class);
      Collection<Group> groups = orgService.getGroupHandler().getAllGroups();
      LOG.info("There are {} groups", groups.size());
      return groups;
    } finally {
      RequestLifeCycle.end();
    }
  }

  @Override
  public String getConfirmationMessage() {
    return "ANY memberships migrated as social space managers";
  }

  @Override
  public void setUp() throws SetupException {

  }

  @Override
  public void setFileOpener(ResourceAccessor resourceAccessor) {

  }

  @Override
  public ValidationErrors validate(Database database) {
    return null;
  }
}
