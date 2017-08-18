/*
 * Copyright (C) 2003-2017 eXo Platform SAS.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see<http://www.gnu.org/licenses/>.
 */
package org.exoplatform.social.core.listeners;

import org.exoplatform.commons.utils.ListAccess;
import org.exoplatform.container.PortalContainer;
import org.exoplatform.container.component.RequestLifeCycle;
import org.exoplatform.services.listener.Asynchronous;
import org.exoplatform.services.listener.Event;
import org.exoplatform.services.listener.Listener;
import org.exoplatform.services.log.ExoLogger;
import org.exoplatform.services.log.Log;
import org.exoplatform.services.security.ConversationRegistry;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.services.security.Identity;
import org.exoplatform.social.core.space.SpaceUtils;
import org.exoplatform.social.core.space.model.Space;
import org.exoplatform.social.core.space.spi.SpaceService;

@Asynchronous
public class SpaceManagersAuthenticationListener extends Listener<ConversationRegistry, ConversationState> {
  private static final Log LOG   = ExoLogger.getLogger(SpaceManagersAuthenticationListener.class);

  private static final int LIMIT = 100;

  private PortalContainer  container;

  private SpaceService     spaceService;

  public SpaceManagersAuthenticationListener(PortalContainer container) {
    this.container = container;
  }

  /**
   * Gives manager roles to the user if he's member of spaces super managers
   * 
   * {@inheritDoc}
   */
  @Override
  public void onEvent(Event<ConversationRegistry, ConversationState> event) {
    if (spaceService == null) {
      spaceService = this.container.getComponentInstanceOfType(SpaceService.class);
    }
    ConversationState state = event.getData();
    Identity identity = state.getIdentity();
    String userId = identity.getUserId();
    if (spaceService.isSuperManager(userId)) {
      RequestLifeCycle.begin(container);
      try {
        ListAccess<Space> allSpacesListAccess = spaceService.getAllSpacesWithListAccess();
        int size = allSpacesListAccess.getSize();
        int offset = 0;
        while (offset < size) {
          Space[] spaces = allSpacesListAccess.load(offset, LIMIT);
          for (Space space : spaces) {
            SpaceUtils.addMembershipsToSuperManagerOfSpace(identity, space.getGroupId());
          }
          offset += LIMIT;
        }
      } catch (Exception e) {
        LOG.error("Error while updating volatile memberships of user " + userId, e);
      } finally {
        RequestLifeCycle.end();
      }
    }
  }
}
