js-crop image cropping plugin
===========================

js-crop is an easy way to add image cropping functionality to
your web application. This plugin is inspired by an article of Mike Riethmuller. This plugin was supplemented with new features and configurations.
Cross-platform Compatibility
----------------------------

* Firefox 1.5
* Firefox Mobile 1.0
* Safari 2.0
* Safari Mobile 1.0
* Opera 9.0
* Opera Mobile ?
* Google Chrome 1.0
* Internet Explorer 9.0
* Android ?

Feature Overview
----------------

* Attaches unobtrusively to any image
* Supports aspect ratio locking
* Supports minSize/maxSize setting
* Callbacks when selection or resize is done
* Support for CSS styling

Contributors
============

**Special thanks to the following contributors:**

* Mike Riethmuller (This plugin is inspired by one of his articles)

MIT License
===========

## How can I use it?

Include jquery and jquery-js-jcrop plugins

```html
    <script src="../jquery.js"></script>
    <script src="../jquery-js-crop.js"></script>
```

Include CSS styles

```html
    <link rel="stylesheet" type="text/css" href="../jquery-js-crop.css" />
```

Call $.jsCrop()

```javascript

//jsCrop must be apply over an image element.
$(image).jsCrop();

```

## How do I set it up?

* `min_width` : Min width allow to resize. (default: 200)
* `min_height` : Min height allow to resize. (default: 200)
* `max_width` : Max width allow to resize. (default: 1920)
* `max_height` : Max height allow to resize. (default: 1800)
* `overlay_width` : Crop region width. (default: 200)
* `overlay_height` : Crop region height. (default: 200)
* `resizable` : Allow the user resize the image. (default: true)
* `unlimited` : Allows the user to get out of the boundaries of the crop region. (default: false)
* `constrain` : Keeps image proportion when resize. (default: false)
* `on_change` : Raise when image position or dimentions change. (default: function (coords) { })          
       
```javascript
...
//Example
$(image).jsCrop({
    min_width: 300,
    resizable: false,
});
...
```       
           
#### Copyright (c) 

**js-crop is free software under MIT License.**

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

