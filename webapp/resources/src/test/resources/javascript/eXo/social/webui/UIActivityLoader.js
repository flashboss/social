(function ($){
  var UIActivityLoader = {
    delta : 65,
    numberOfReqsPerSec : 10,//Perfect range: 5 -> 20
    hasMore: false,
    loaderButton: $('#ActivitiesLoader'),
    parentContainer : $('#UIActivitiesLoader'),
    scrollBottom : function() {
      return $(document).height() - $(window).scrollTop() - $(window).height();  
    },
    init: function (parentId, hasMore) {
      var me = UIActivityLoader;
      me.hasMore = (hasMore === true || hasMore === 'true');
      me.parentContainer = $('#' + parentId);

      $(document).ready(function() {
        // check onLoad page.
        if(me.scrollBottom() <= me.delta) {
          $(window).scrollTop($(document).height() - $(window).height() - (me.delta+1));
        }
        $(window).scroll(function(e) {
          var distanceToBottom = me.scrollBottom();
          var loadAnimation = me.parentContainer.find('div.ActivityIndicator');
          if (me.hasMore === true &&
                distanceToBottom <= me.delta &&
                  loadAnimation.css("display") === 'none') {
            //
            loadAnimation.css('visibility', 'hidden').stop(true, true).fadeIn(500, function() {
              setTimeout(function(){loadAnimation.css('visibility', 'visible'); }, 300);
              var action = me.loaderButton.data('action');
              window.ajaxGet(action, function(data) {
                me.parentContainer.find('div.ActivityIndicator').hide();
              });
            });
          }
        });
        //
        me.processBottomTimeLine();
      });
    },
    setStatus : function(hasMore) {
      var me = UIActivityLoader;
      if(me.scrollBottom() <= me.delta) {
        $(window).scrollTop($(window).scrollTop()-5);
      }
      me.hasMore = (hasMore === true || hasMore === 'true');
      me.processBottomTimeLine();
    },
    processBottomTimeLine : function() {
      var me = UIActivityLoader;
      if (me.hasMore) {
        $('div.activityBottom').hide();
        me.loaderButton.parent().show();
      } else {
        $('div.activityBottom').show();
        me.loaderButton.parent().hide();
      }
    },
    renderActivity : function(activityItem) {
      window.ajaxGet(activityItem.data('url') + activityItem.attr('id'), function(data) {
        activityItem.attr('style', '');
      });
    },
    loadingActivities : function(id) {
      var me = UIActivityLoader;
      var container = $('#' + id);
      var url = container.find('div.uiActivitiesLoaderURL:first').data('url');
      if (url === undefined || url.length === 0) {
        return;
      }
      var items = container.find('div.activity-loadding').data('url', url);
      var batchDelay = 1000;// 1000ms ~ 1s
      me.renderActivity(items.eq(0));
      var index = 1;
      var interval = window.setInterval(function() {
        if (index < items.length) {
          me.renderActivity(items.eq(index));
        } else {
          window.clearInterval(interval);
        }
        ++index;
      }, batchDelay / me.numberOfReqsPerSec);
    }
  };
  return UIActivityLoader;
})($);