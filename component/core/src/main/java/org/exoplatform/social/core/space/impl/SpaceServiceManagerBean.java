package org.exoplatform.social.core.space.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.exoplatform.management.annotations.Impact;
import org.exoplatform.management.annotations.ImpactType;
import org.exoplatform.management.annotations.Managed;
import org.exoplatform.management.annotations.ManagedDescription;
import org.exoplatform.management.annotations.ManagedName;
import org.exoplatform.management.jmx.annotations.NameTemplate;
import org.exoplatform.management.jmx.annotations.Property;
import org.exoplatform.management.rest.annotations.RESTEndpoint;
import org.exoplatform.social.core.space.spi.SpaceService;

@Managed
@ManagedDescription("Social Service manager bean")
@NameTemplate({ @Property(key = "service", value = "social"), @Property(key = "view", value = "spaceservice") })
@RESTEndpoint(path = "spaceservice")
public class SpaceServiceManagerBean {
  SpaceService spaceService;

  public SpaceServiceManagerBean(SpaceServiceImpl spaceServiceImpl) {
    this.spaceService = spaceServiceImpl;
  }

  /**
   * Gets the list of permission expressions of space super managers.
   * See {@link SpaceService#getSuperManagersRoles()}
   * 
   * @return {@link List} of type {@link String}
   */
  @Managed
  @ManagedDescription("Get Spaces super administrators")
  @Impact(ImpactType.READ)
  public List<String> getSpaceManager() {
    return spaceService.getSuperManagersRoles()
                       .stream()
                       .map(membership -> membership.getMembershipType() + ":" + membership.getGroup())
                       .collect(Collectors.toList());
  }

  /**
   * See {@link SpaceService#addSuperManagersRoles(String)}
   * 
   * @param permissionExpression permission expression of type {@link String}
   * 
   * @throws Exception
   */
  @Managed
  @ManagedDescription("Add Spaces super administrators role")
  @Impact(ImpactType.WRITE)
  public void addSpaceManager(@ManagedDescription("Spaces super manger role") @ManagedName("permissionExpression") String permissionExpression) throws Exception {
    spaceService.addSuperManagersRoles(permissionExpression);
  }
}
