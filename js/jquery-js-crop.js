/**
 * @license MIT
 * @author: Alejandro Dominguez Borroto
 * @description: jQuery plugin that lets you select a region of an image 
 * @name jquery-js-plugin.js
 */

(function ($, document) {

    /* 
     * @param [opts]
     * @param {number} [opts.min_width]
     * @param {number} [opts.min_height]
     * @param {number} [opts.max_width]
     * @param {number} [opts.max_height]
     * @param {number} [opts.overlay_width]
     * @param {number} [opts.overlay_height]
     * @param {bool} [opts.resizable]
     * @param {bool} [opts.unlimited]
     * @param {bool} [opts.constrain]
     * @param {string} [opts.scaleInputId]
     * @param {Function} [opts.on_change]
     */
    $.fn.jsCrop = function (opts) {

        //Defaults values
        var defaults = {
            min_width: 200,
            min_height: 200,
            max_width: 1920,
            max_height: 1800,
            overlay_width: 200,
            overlay_height: 200,
            resizable: true,
            unlimited: false,
            constrain: false,
            scaleInputId: null,
            on_change: function (coords) { }
        };

        var options = $.extend(defaults, opts);
        var store = {};

        var resizeableImage = function (imageT) {
            // Some variable and settings
            var $container,
                origSrc = new Image(),
                imageTarget = $(imageT).get(0),
                eventState = {},
                constrain = options.constrain,
                minWidth = options.min_width,
                minHeight = options.min_height,
                maxWidth = options.max_width,
                maxHeight = options.max_height,
                overlayWidth = options.overlay_width,
                overlayHeight = options.overlay_height,
                resizeCanvas = document.createElement('canvas');

            var init = function () {

                // When resizing, we will always use this copy of the original as the base
                origSrc.src = imageTarget.src;

                //Store width and height from real image 
                store.orgImageW = imageTarget.width;
                store.orgImageH = imageTarget.height;

                // Wrap the image with the container and add resize handles
                $(imageTarget).wrap('<div class="resize-component"></div>')
                    .before('<div class="resize-overlay"><div class="resize-overlay-inner"></div></div>');

                $(imageTarget).wrap('<div class="resize-container"></div>')
                .before('<span class="resize-handle resize-handle-nw"></span>')
                .before('<span class="resize-handle resize-handle-ne"></span>')
                .after('<span class="resize-handle resize-handle-se"></span>')
                .after('<span class="resize-handle resize-handle-sw"></span>');

                //Setting overlay dimentions
                $('.resize-overlay').css({ width: overlayWidth + 'px', height: overlayHeight + 'px' });

                // Assign the container to a variable
                $container = $(imageTarget).parent('.resize-container');

                // Add events
                if (options.resizable)
                    $container.on('mousedown touchstart', '.resize-handle', startResize);
                else
                    $('.resize-handle').css({ cursor: 'auto' });

                $container.on('mousedown touchstart', 'img', startMoving);

                //Call on_change
                options.on_change(getCoords());

                //Handle scale resize
                if (options.scaleInputId) {
                    $('#' + options.scaleInputId).change(function (e) {
                        var scale = $(this).val();
                        scaleImage(scale);
                    });
                }
                //Put the image inside the the overlay
                keepInside();
            };

            var startResize = function (e) {
                e.preventDefault();
                e.stopPropagation();
                saveEventState(e);
                $(document).on('mousemove touchmove', resizing);
                $(document).on('mouseup touchend', endResize);
            };

            var endResize = function (e) {
                e.preventDefault();
                $(document).off('mouseup touchend', endResize);
                $(document).off('mousemove touchmove', resizing);
                //Call on_change
                options.on_change(getCoords());
            };

            var saveEventState = function (e) {
                // Save the initial event details and container state
                eventState.container_width = $container.width();
                eventState.container_height = $container.height();
                eventState.container_left = $container.offset().left;
                eventState.container_top = $container.offset().top;
                eventState.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
                eventState.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

                // This is a fix for mobile safari
                // For some reason it does not allow a direct copy of the touches property
                if (typeof e.originalEvent.touches !== 'undefined') {
                    eventState.touches = [];
                    $.each(e.originalEvent.touches, function (i, ob) {
                        eventState.touches[i] = {};
                        eventState.touches[i].clientX = 0 + ob.clientX;
                        eventState.touches[i].clientY = 0 + ob.clientY;
                    });
                }
                eventState.evnt = e;
            };

            var resizing = function (e) {
                var mouse = {}, width, height, left, top, offset = $container.offset();
                mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
                mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

                // Position image differently depending on the corner dragged and constraints
                if ($(eventState.evnt.target).hasClass('resize-handle-se')) {
                    width = mouse.x - eventState.container_left;
                    height = mouse.y - eventState.container_top;
                    left = eventState.container_left;
                    top = eventState.container_top;
                } else if ($(eventState.evnt.target).hasClass('resize-handle-sw')) {
                    width = eventState.container_width - (mouse.x - eventState.container_left);
                    height = mouse.y - eventState.container_top;
                    left = mouse.x;
                    top = eventState.container_top;
                } else if ($(eventState.evnt.target).hasClass('resize-handle-nw')) {
                    width = eventState.container_width - (mouse.x - eventState.container_left);
                    height = eventState.container_height - (mouse.y - eventState.container_top);
                    left = mouse.x;
                    top = mouse.y;
                    if (constrain || e.shiftKey) {
                        top = mouse.y - ((width / origSrc.width * origSrc.height) - height);
                    }
                } else if ($(eventState.evnt.target).hasClass('resize-handle-ne')) {
                    width = mouse.x - eventState.container_left;
                    height = eventState.container_height - (mouse.y - eventState.container_top);
                    left = eventState.container_left;
                    top = mouse.y;
                    if (constrain || e.shiftKey) {
                        top = mouse.y - ((width / origSrc.width * origSrc.height) - height);
                    }
                }

                // Optionally maintain aspect ratio
                if (constrain || e.shiftKey) {
                    height = width / origSrc.width * origSrc.height;
                }

                if (width > minWidth && height > minHeight && width < maxWidth && height < maxHeight) {
                    // To improve performance you might limit how often resizeImage() is called
                    resizeImage(width, height);
                    // Without this Firefox will not re-calculate the the image dimensions until drag end
                    $container.offset({ 'left': left, 'top': top });
                }
                else {
                    //Resize when image is more big than max_width or max_height
                    var imageWidth = $('.resize-image').width();
                    var imageHeigth = $('.resize-image').height();
                    var ratio;
                    if (imageWidth > options.max_width) {
                        ratio = (options.max_width / imageWidth) * 0.5;
                        resizeImage(imageWidth * ratio, imageHeigth * ratio);
                    }

                    else if (imageHeigth > options.max_height) {
                        ratio = (options.max_height / imageHeigth) * 0.5;
                        resizeImage(imageWidth * ratio, imageHeigth * ratio);
                    }
                }
            };

            var scaleImage = function (scale) {

                var newWidth = store.orgImageW * scale;
                var newHeight = store.orgImageH * scale;

                if (newWidth < options.min_width || newHeight < options.min_height) {

                    var newScaleW = options.min_width / newWidth;
                    var newScaleH = options.min_height / newHeight;
                    newWidth = newWidth * Math.max(newScaleH, newScaleW);
                    newHeight = newHeight * Math.max(newScaleH, newScaleW);
                }
                resizeImage(newWidth, newHeight);
                keepInside();
            };

            var resizeImage = function (width, height) {
                resizeCanvas.width = width;
                resizeCanvas.height = height;
                resizeCanvas.getContext('2d').drawImage(origSrc, 0, 0, width, height);
                var src = resizeCanvas.toDataURL("image/png");
                $(imageTarget).attr('src', src);
            };
            
            var startMoving = function (e) {
                e.preventDefault();
                e.stopPropagation();
                saveEventState(e);
                $(document).on('mousemove touchmove', moving);
                $(document).on('mouseup touchend', endMoving);
            };

            var endMoving = function (e) {
                e.preventDefault();
                $(document).off('mouseup touchend', endMoving);
                $(document).off('mousemove touchmove', moving);

                //Call on_change
                options.on_change(getCoords());
            };

            var moving = function (e) {
                var mouse = {}, touches;
                e.preventDefault();
                e.stopPropagation();

                touches = e.originalEvent.touches;

                mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft();
                mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();


                $container.offset({
                    'left': mouse.x - (eventState.mouse_x - eventState.container_left),
                    'top': mouse.y - (eventState.mouse_y - eventState.container_top)
                });
                keepInside();
                // Watch for pinch zoom gesture while moving
                if (eventState.touches && eventState.touches.length > 1 && touches.length > 1) {
                    var width = eventState.container_width, height = eventState.container_height;
                    var a = eventState.touches[0].clientX - eventState.touches[1].clientX;
                    a = a * a;
                    var b = eventState.touches[0].clientY - eventState.touches[1].clientY;
                    b = b * b;
                    var dist1 = Math.sqrt(a + b);

                    a = e.originalEvent.touches[0].clientX - touches[1].clientX;
                    a = a * a;
                    b = e.originalEvent.touches[0].clientY - touches[1].clientY;
                    b = b * b;
                    var dist2 = Math.sqrt(a + b);

                    var ratio = dist2 / dist1;

                    width = width * ratio;
                    height = height * ratio;
                    // To improve performance you might limit how often resizeImage() is called
                    resizeImage(width, height);
                }
            };

            var keepInside = function () {

                if (options.unlimited)
                    return;
                
                //Keep image inside region
                var left = $('.resize-overlay').offset().left - $container.offset().left;
                var top = $('.resize-overlay').offset().top - $container.offset().top;
                var imageWidth = $('.resize-image').width();
                var imageHeight = $('.resize-image').height();

                if (left < 0) {
                    $container.offset({
                        'left': $('.resize-overlay').offset().left,
                    });
                }
                if (top < 0) {
                    $container.offset({
                        'top': $('.resize-overlay').offset().top,
                    });
                }
                if (left + options.overlay_width > imageWidth) {
                    $container.offset({
                        'left': $('.resize-overlay').offset().left - imageWidth + options.overlay_width,
                    });
                }
                if (top + options.overlay_height > imageHeight) {
                    $container.offset({
                        'top': $('.resize-overlay').offset().top - imageHeight + options.overlay_height,
                    });
                }

            };

            var getCoords = function () {

                var left = $('.resize-overlay').offset().left - $container.offset().left;
                var top = $('.resize-overlay').offset().top - $container.offset().top;
                var width = $('.resize-overlay').width();
                var height = $('.resize-overlay').height();
                var imageWidth = $('.resize-image').width();
                var imageHeight = $('.resize-image').height();

                return {
                    current: {
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                        imageWidth: imageWidth,
                        imageHeight: imageHeight,
                    },
                    original: {
                        left: (store.orgImageW / imageWidth) * left,
                        top: (store.orgImageH / imageHeight) * top,
                        width: width,
                        height: height,
                        imageWidth: store.orgImageW,
                        imageHeight: store.orgImageH,
                    }
                };

            };

            init();
        };

        return resizeableImage($(this));
    };



})(jQuery, document);