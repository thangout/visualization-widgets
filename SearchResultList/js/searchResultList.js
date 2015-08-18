define(['jquery', 'jquery_ui', 'jquery_raty', 'settings'], function ($, jQuery_ui, raty, settings){

   var EEXCESS = EEXCESS || {};

   /**
    * Implements a search result list, which can be used by all components.
    * The list updates itself, if a new query was issued and new results arrive.
    * Ratings are updated as well.
    * Required css-files:
    * - eexcess.css
    * - searchResultList.css
    * - jquery-ui.css
    * Handlers for preview and rating can be customized via options, as well as the
    * path to the media folder and the path to the libs folder
    * 
    * See an usage example in /usage_examples searchResultList.js and searchResultList.html
    * @param {Jquery div elmeent} divContainer
    * @param {Object} options
    */
   (function(divContainer, options) {
       divContainer.prepend($('<ul class="eexcess_tabs"><li class="active"><a href="#">All</a></li><li><a href="#">Media</a></li><li><a href="#">Cultural</a></li><li><a href="#">Scholarly</li></ul>'));
       $('.eexcess_tabs li').on('click', function() {
           $('#result_gallery').remove();
           $('.empty_result').hide();
           $('.eexcess_tabs li.active').removeClass('active');
           $(this).addClass('active');
           switch ($(this).children('a').text()) {
               case 'Media':
                   $('.pagination').hide();
                   $("#recommendationList li").hide();
                   var li_items = $("#recommendationList li");
                   var no_images = true;
                   var l_h = 0;
                   var r_h = 0;
                   var gallery = $('<div id="result_gallery"></div>');
                   gallery.append($('<div id="result_gallery0" class="g_tile"></div>')).append($('<div id="result_gallery1" class="g_tile"></div>'));
                   divContainer.append(gallery);
                   for (var i = 0; i < li_items.length; i++) {
                       var img_src = $(li_items[i]).children('.resCtL').children('a').children('img').attr('src');
                       if (img_src.indexOf('media/no-img.png') === -1) {
                           var img = $('<img src="' + img_src + '" class="gallery_img" />');
                           if (img.get(0).naturalWidth === 200 && img.get(0).naturalHeight === 275) {
                               continue;
                           }
                           no_images = false;
                           var original_link = $(li_items[i]).children('.eexcess_resContainer').children('a');
                           var url = original_link.attr('href');
                           var title = original_link.text();
                           var link = $('<a href="' + url + '" title="' + title + '"></a>');
                           link.append(img);
                           link.click(function(evt) {
                               evt.preventDefault();
                               settings.previewHandler(this.href);
                           });
                           if (l_h > r_h) {
                               $('#result_gallery1').append(link);
                               r_h += img.height();
                           } else {
                               $('#result_gallery0').append(link);
                               l_h += img.height();
                           }

                       }
                   }
                   if (no_images) {
                       $('#result_gallery').hide();
                       $('.empty_result').show();
                   } else {
                       $('#result_gallery').show();
                   }
                   break;
               case 'Cultural':
                   $('.pagination').hide();
                   $("#recommendationList li").hide();
                   var li_items = $("#recommendationList li");
                   var no_culture = true;
                   for (var i = 0; i < li_items.length; i++) {
                       var prov = $(li_items[i]).children('.resCtL').children('img').attr('alt');
                       if (prov.indexOf('Europeana') !== -1 || prov.indexOf('KIM.Collect') !== -1) {
                           $(li_items[i]).show();
                           no_culture = false;
                       }
                   }
                   if (no_culture) {
                       $('.empty_result').show();
                   }
                   break;
               case 'Scholarly':
                   $('.pagination').hide();
                   $("#recommendationList li").hide();
                   var li_items = $("#recommendationList li");
                   var no_scholarly = true;
                   for (var i = 0; i < li_items.length; i++) {
                       var prov = $(li_items[i]).children('.resCtL').children('img').attr('alt');
                       if (prov.indexOf('ZBW') !== -1 || prov.indexOf('Mendeley') !== -1) {
                           $(li_items[i]).show();
                           no_scholarly = false;
                       }
                   }
                   if (no_scholarly) {
                       $('.empty_result').show();
                   }
                   break;
               default:
                   $('.pagination').show();
                   $("#recommendationList li").hide().slice(0, settings.itemsShown).show();
                   $('.page.active').removeClass('active');
                   $('.page').first().addClass('active');
           }
       });
       var _innerContainer = $('<div class="scrollable-y"></div>');//.height(divContainer.height() - $('.eexcess_tabs').height());
       divContainer.append(_innerContainer);
       divContainer = _innerContainer;


       /**
        * Event handler on the pagination buttons
        * 
        */

       $(document).on('click', '.page', function() {
           $('.page.active').removeClass('active');
           $(this).addClass('active');
           var page = parseInt($(this).html()) - 1;
           var min = page * settings.itemsShown;
           var max = min + settings.itemsShown;

           $("#recommendationList li").hide().slice(min, max).show();
       })

       var _loader = $('<div class="eexcess_loading" style="display:none"><img src="' + settings.pathToMedia + 'loading.gif" /></div>');
       var _list = $('<ul id="recommendationList" class="block_list" data-total="0"></ul>').append($('<li>no results</li>'));
       var _dialog = $('<div style="display:none"><div>').append('<p></p>');
       var _error = $('<p style="display:none">sorry, something went wrong...</p>');

       var _link = function(url, img, title) {
           var link = $('<a href="' + url + '">' + title + '</a>');
           link.click(function(evt) {
               evt.preventDefault();
               settings.previewHandler(url);
           });
           _thumbnail(link, img);
           return link;
       };
       var _thumbnail = function(link, img) {
           // thumbnail on hover
           var xOffset = 10;
           var yOffset = 30;
           link.hover(
                   function(e) {
                       $('#eexcess_thumb_img').attr('src', img).css('max-width', '280px');
                       $('#eexcess_thumb')
                               .css('position', 'absolute')
                               .css('top', (e.pageY - xOffset) + 'px')
                               .css('left', (e.pageX + yOffset) + 'px')
                               .css('z-index', 9999)
                               .show();
                   },
                   function() {
                       $('#eexcess_thumb').hide();
                   });
           link.mousemove(function(e) {
               $('#eexcess_thumb')
                       .css('top', (e.pageY - xOffset) + 'px')
                       .css('left', (e.pageX + yOffset) + 'px');
           });
       };
       var _rating = function(element, uri, score) {
           element.raty({
               score: score,
               path: settings.pathToLibs + 'rating/img',
               number: 2,
               width: false,
               iconRange: [
                   {range: 1, on: 'thumb_down-on.png', off: 'thumb_down-off.png'},
                   {range: 2, on: 'thumb_up-on.png', off: 'thumb_up-off.png'}
               ],
               hints: ['bad', 'good'],
               single: true,
               click: function(score, evt) {
                   settings.ratingHandler(this.uri, score, this.element.data('pos'));
               }.bind({uri: uri, element: element})
           });
       };

       // init
       $('body').append('<p id="eexcess_thumb" style="display:none;"><img id="eexcess_thumb_img" alt="img preview" /></p>');
       divContainer.append(_loader);
       divContainer.append(_dialog);
       divContainer.append(_list);
       divContainer.append(_error);
       divContainer.append($('<p class="empty_result">no results :(</p>').hide());

       // obtain current results
       // TODO: neccessary??????
       window.top.postMessage({event: 'eexcess.currentResults'}, '*');

       // listen for updates

       window.onmessage = function(e) {
           if (e.data.event) {
               if (e.data.event === 'eexcess.newResults') {
                   showResults(e.data.data);
               } else if (e.data.event === 'eexcess.queryTriggered') {
                   _loading();
               } else if (e.data.event === 'eexcess.error') {
                   _showError(e.data.data);
               } else if (e.data.event === 'eexcess.rating') {
                   _rating($('.eexcess_raty[data-uri="' + e.data.data.uri + '"]'), e.data.data.uri, e.data.data.score);
               }
           }
       };
       
       var showResults = function(data) {
           $('.eexcess_tabs li.active').removeClass('active');
           $('.eexcess_tabs li').first().addClass('active');
           $('#result_gallery').remove();
           _error.hide();
           _loader.hide();
           data = data.results || null;
           _list.empty();

           if (data === null || data.totalResults === 0 || data.totalResults === '0') {
               _list.append($('<li>no results</li>'));
               return;
           }
           _list.attr('data-total', data.totalResults);

           var height = (window.innerHeight || document.body.clientHeight) - 120;
           settings.itemsShown = Math.floor(height / 50);


           var _pagination = $('<div class="pagination"></div>');
           var pages = (Math.ceil(data.results.length / settings.itemsShown) > 10) ? 10 : Math.ceil(data.results.length / settings.itemsShown);

           if (pages > 1) {

               for (var i = 1; i <= pages; i++) {
                   var _btn = $('<a href="#" class="page gradient">' + i + '</a>');
                   if (i == 1) {
                       _btn.addClass('active');
                   }
                   _pagination.append(_btn);
               }

               if (divContainer.find('.pagination').length != 0) {
                   divContainer.find('.pagination').remove();
               }

               divContainer.append(_pagination)
           }
           moreResults(data.results);
       };

       var moreResults = function(items) {
   //            $('#eexcess_content').unbind('scroll'); TODO: check scrolling...
           var offset = _list.children('li').length;
           for (var i = 0, len = items.length; i < len; i++) {

               var item = items[i];
               var img = item.previewImage;
               if (typeof img === 'undefined' || img === '') {
                   img = settings.pathToMedia + 'no-img.png';
               }
               var title = item.title;

               if (typeof title === 'undefined') {
                   title = 'no title';
               }
               var pos = i + offset;
               var li = $('<li data-pos="' + pos + '" data-id="' + item.documentBadge.id + '"></li>');

               _list.append(li);


               if (i >= settings.itemsShown) {
                   li.hide();
               }

               // rating
               var raty = $('<div class="eexcess_raty"  data-uri="' + item.documentBadge.uri + '" data-pos="' + pos + '"></div');
               _rating(raty, item.documentBadge.uri, item.rating);
               li.append(raty);

               var containerL = $('<div class="resCtL"></div>');
               li.append(containerL);
               containerL.append(_link(item.documentBadge.uri, img, '<img class="eexcess_previewIMG" src="' + img + '" />'));

               // contents
               var resCt = $('<div class="eexcess_resContainer"></div>');
               resCt.append(_link(item.documentBadge.uri, img, title));
               li.append(resCt);

               // partner icon and name
               if (typeof item.documentBadge.provider !== 'undefined') {
                   var providerName = item.documentBadge.provider.charAt(0).toUpperCase() + item.documentBadge.provider.slice(1);
                   containerL.append($('<img alt="provided by ' + providerName + '" title="provided by ' + providerName + '" src="' + settings.pathToMedia + 'icons/' + item.documentBadge.provider + '-favicon.ico" class="partner_icon" />'));
               }

               // show link
               var linkCopy = $('<a href="" title="show URL of the resource"><img src="' + settings.pathToMedia + 'icons/link.png" /></a>');
               linkCopy.click(function(evt) {
                   evt.preventDefault();
                   _dialog.children('p').text(this);
                   var at = 'center top+' + evt.pageY;
                   _dialog.dialog({
                       title: 'URL of the resource',
                       height: 130,
                       position: {my: "center", at: at}
                   });
                   // select the link
                   var selection = window.getSelection();
                   var range = document.createRange();
                   range.selectNodeContents(_dialog.children('p').get()[0]);
                   selection.removeAllRanges();
                   selection.addRange(range);
               }.bind(item.documentBadge.uri));
               containerL.append(linkCopy);

               // description
               if (typeof item.description !== 'undefined' && item.description !== '') {
                   var shortDescription = shortenDescription(item.description);
   //                resCt.append($('<p class="result_description">' + item.description + '</p>'));
                   resCt.append($('<p class="result_description">' + shortDescription + '</p>'));
               }
               resCt.append($('<p style="clear:both;"></p>'));

           }
           divContainer.find('.eexcess_previewIMG').error(function() {
               $(this).unbind("error").attr("src", settings.pathToMedia + 'no-img.png');
           });
       };

       var shortenDescription = function(description) {

           var firstPart = description.substring(0, 100);
           var remainder = description.substring(100, description.length);
           var endPos = remainder.search(/[.!?; ]/);
           if (endPos != -1) {
               firstPart += remainder.substring(0, endPos);
               firstPart += "...";
           }
           return firstPart;
       };

       var _showError = function(errorData) {
           divContainer.find('.pagination').remove();
           _list.empty();
           _loader.hide();
           if (errorData === 'timeout') {
               _error.text('Sorry, the server takes too long to respond. Please try again later');
           } else {
               _error.text('Sorry, something went wrong');
           }
           _error.show();
           $('#eexcess_thumb').hide();
       };

       var _loading = function() {
           $('#result_gallery').remove();
           $('#eexcess_thumb').hide();
           divContainer.find('.pagination').remove();
           _error.hide();
           _list.empty();
           $('.empty_result').hide();
           _loader.show();
       };

       return {
           showResults: showResults,
           loading: _loading
       };
   })($('#resultListArea'));
});

