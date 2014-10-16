@Application
@Portlet
@Bindings({ 
    @Binding(GroupPrefs.class), 
    @Binding(SpaceService.class) 
  }
)

package org.exoplatform.social.portlet.spaceManagement;

import juzu.Application;
import juzu.plugin.portlet.Portlet;
import juzu.plugin.binding.Binding;
import juzu.plugin.binding.Bindings;


import org.exoplatform.social.core.space.GroupPrefs;
import org.exoplatform.social.core.space.spi.SpaceService;