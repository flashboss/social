(function($) {
    var invite = {
        build: function(selector, url, placeholder) {
            $('#' + selector).suggester({
                type : 'tag',
                placeholder: placeholder,
                plugins: ['remove_button', 'restore_on_backspace'],
                preload: true,
                maxItems: null,
                valueField: 'value',
                labelField: 'text',
                searchField: ['text'],
                sourceProviders: ['exo:social'],
                create: function(input) {
                    return {'value': input, 'text': input, 'invalid': true};
                },
                createOnBlur: true,
                renderItem: function(item, escape) {
                    if (item.invalid) {
                        return '<div class="item invalid">' + item.text + '</div>';
                    } else {
                        return '<div class="item">' + item.text + '</div>';                         
                    }
                },
                renderMenuItem: function(item, escape) {
                  var avatar = item.avatarUrl;
                  if (avatar == null) {
                      if (item.type == "space") {
                          avatar = '/eXoSkin/skin/images/system/SpaceAvtDefault.png';
                      } else {
                          avatar = '/eXoSkin/skin/images/system/UserAvtDefault.png';
                      }
                  }

                  return '<div class="option">' +
                  '<img width="20px" height="20px" src="' + avatar + '"> ' +
                  escape(item.text) + '</div>';
                },
                onItemRemove: function(value) {
                  var item = this.options[value];
                  if (item.invalid === true) {
                    this.removeOption(value);
                  }
                },
              sortField: [{field: 'order'}, {field: '$score'}],
              providers: {
                'exo:social': function(query, callback) {
                    if (query == '') {
                      var thizz = this;
                      // Pre-load options for initial users
                      if (this.items && this.items.length > 0) {
                          $.ajax({
                              type: "GET",
                              url: url,
                              data: { nameToSearch : this.items.join() + "," },
                              complete: function(jqXHR) {
                                  if(jqXHR.readyState === 4) {
                                      var json = $.parseJSON(jqXHR.responseText)
                                      if (json.options != null) {
                                          callback(json.options);
                                          for (var i = 0; i < json.options.length; i++) {
                                              thizz.updateOption(json.options[i].value, json.options[i]);
                                          }
                                      }
                                  }
                              }
                          });
                      }
                    } else {
                        $.ajax({
                            type: "GET",
                            url: url,
                            data: { nameToSearch : query },
                            complete: function(jqXHR) {
                                if(jqXHR.readyState === 4) {
                                    var json = $.parseJSON(jqXHR.responseText)
                                    if (json.options != null) {
                                        callback(json.options);
                                    }
                                }
                            }
                        });
                    }
                  } 
                }
            });            
        },

        notify: function(selector, anchor) {
            $(anchor).append($(selector));
            setTimeout(function(){ $(anchor).fadeOut() }, 5000);
        }
    };

    return invite;
})($);