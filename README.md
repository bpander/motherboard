# Motherboard

Motherboard is a small (less than 3k gzipped), extensible foundation for client-side JavaScript applications.

## Origins

### Address Complex UI Behaviors

Angular, React, and similar frameworks are primarily concerned with updating views as data changes. But a common problem encountered when building web apps they don't directly address is communicating between components, e.g. an async-form in a modal that should cancel its current request if the modal is closed. Motherboard aims to be a tool to make these kinds of complex UI behaviors easier to build and maintain.

### A Reaction Against Monolithic, Wheel-Reinventing Frameworks

Motherboard is meant to be a foundation to build on. It doesn't force a specific router, templating engine, etc. on you. You can use whatever components are appropriate for your project. If one stops being good, you can easily swap it out for a different (better) one. This also helps keep page-weight down. This <a href="http://bpander.github.io/motherboard-todos/" target="_blank">TodoMVC app using Motherboard</a> is only **7.3 KB** of JavaScript (gzipped and minified). By comparison, the AngularJS framework alone is 45 KB (gzipped and minified).

## Browser support

Motherboard can be polyfilled to work back to IE9. Check the <a href="#polyfill-table">Polyfill Table</a> to see which polyfills to use for your project (if any).

## Usage

`bower install motherboard`

### Custom Elements

Motherboard uses the <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements" target="_blank">Custom Element API</a> to directly tie an element to the UI component it represents.

**HTML**
```html
<m-tabpanel></m-tabpanel>
```

**JS**
```js
var MTabPanel = M.element('m-tabpanel', function (proto, base) {

    // All the lifecycle callbacks are exposed
    proto.createdCallback = function () {
        base.createdCallback.call(this);
        ...
    };

});
```

### Custom Attributes

Motherboard includes a custom attribute API for easy configuration.

**Defining custom attributes**
```js
var MCarousel = M.element('m-carousel', function (proto, base) {

    proto.customAttributes.push(

        M.attribute('autoplay', { type: Boolean }),

        M.attribute('delay', {
            type: Number,
            default: 3000,
            changedCallback: function (oldVal, newVal) {
                // I'll fire whenever the 'delay' attribute/property is changed
            }
        }),

        M.attribute('easing', {
            type: String,
            default: 'ease-out'
        })

    );
});
```

```html
<m-carousel></m-carousel>
```

```js
var carousel = document.getElementsByTagName('m-carousel')[0];
carousel.autoplay; // false
carousel.delay; // 3000
carousel.easing; // "ease-out"
```

```html
<m-carousel autoplay delay="5000" easing="linear"></m-carousel>
```

```js
var carousel = document.getElementsByTagName('m-carousel')[0];
carousel.autoplay; // true
carousel.delay; // 5000
carousel.easing; // "linear"
```


### Responsive Attributes

Attributes can be flagged as `responsive` if their values should change depending on the current media.

```js
var MCarousel = M.element('m-carousel', function (proto, base) {

    proto.customAttributes.push(

        M.attribute('slides-visible', {
            type: Number,
            responsive: true,
            default: '(min-width: 768px) 3, 1', // Works just like the img.sizes attribute
            mediaChangedCallback: function (oldVal, newVal) {
                // I'll fire whenever a breakpoint causes the value to change
            }
        })

    );

});
```

```js
var carousel = new MCarousel();
carousel.slidesVisible; // "(min-width: 768px) 3, 1"
carousel.currentSlidesVisible; // `3` if the viewport is 768px or wider, otherwise `1`
```

### Normalized, Intuitive, and Performant DOM Querying

**Use .findWithTag to get one specific tagged element**

```html
<m-modal>
    <button class="btn btn_round" data-tag="close">Close</button>
</m-modal>
```

```js
// Get only the first child element with a matching `data-tag` attribute
var closeButton = modal.findWithTag('close');
```

**Use .findAllWithTag to get all elements with the specified tag**
```html
<m-tabpanel>
    <button data-tag="tab">Section 1</button>
    <button data-tag="tab">Section 2</button>
    <button data-tag="tab">Section 3</button>
</m-tabpanel>
```

```js
// Get all child elements with a matching `data-tag` attribute
var tabs = tabpanel.findAllWithTag('tab');

// Element collections are returned as arrays to make them easier to work with
tabs.forEach(function (tab) {
    ...
});
```

**Use .getComponent(s) when you're looking for a specific type**
```html
<m-slideshow>
    <m-carousel></m-carousel>
    <m-carousel data-tag="m-slideshow.carousel"></m-carousel>
</m-slideshow>
```

```js
var MSlideshow = M.element('m-slideshow', function (proto, base) {
    
    proto.createdCallback = function () {
        base.createdCallback.call(this);

        // Get the first child element of the specified type
        this.carousel = this.getComponent(MCarousel);

        // Get the first child element of the specified type and tag
        this.carousel = this.getComponent(MCarousel, 'm-slideshow.carousel');

        // Get all matching child elements of the specified type
        this.carousels = this.getComponents(MCarousel);

        // Get all matching child elements of the specified type and tag
        this.carousels = this.getComponents(MCarousel, 'm-slideshow.carousel');

        // Element collections are returned as arrays to make them easier to work with
        this.carousels.forEach(function (carousel) {
            ...
        });
    };
});
```
**Note:** The {m-tag.propertyName} pattern isn't forced, it's just a useful convention.


### Event Handling

**A basic example**
```js
var accordion = new MAccordion();
accordion.listen(accordion, 'click', function () {
    console.log('click detected');
});
accordion.enable();
```

**A slightly more complex example**
```js
var MCarousel = M.element('m-carousel', function (proto, base) {
    
    proto.createdCallback = function () {
        base.createdCallback.call(this);
        ...
        this.listen(this.nextButton, 'click', function (e) {
            this.advance(1); // `this` keyword is bound to the specific element instance
        });
        this.enable(); // Enables all listeners
        this.disable(); // Disables all listeners

        // `.listen` can be used with a single element or an array of elements
        this.dotsListener = this.listen(this.dots, 'click', function (e) {
            var index = this.dots.indexOf(e.target);
            this.goTo(index);
        });
        this.dotsListener.enable(); // Enable a specific listener
        this.dotsListener.disable(); // Disable a specific listener
    };
});
```

### Triggering Events

"M" elements use the <a href="https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent" target="_blank">CustomEvent API</a>, but with some helpful convenience methods.

**A basic example**
```js
var carousel = new MCarousel();
var listener = carousel.listen(carousel, 'foo', e => console.log(e.detail));
carousel.enable();
carousel.trigger('foo', { foo: 'bar' }); // logs `{ foo: 'bar' }`
```

**Another basic example**
```js
// Custom events bubble
document.body.addEventListener('foo', function (e) {
    console.log(e.target);
});
document.body.appendChild(carousel);
carousel.trigger('foo'); // logs the <m-carousel> element to the console
```

**A slightly more complex example**
```js
var MCarousel = M.element('m-carousel', function (proto, base) {

    proto.EVENT = {
        SLIDE_CHANGE: 'm-carousel.slidechange'
    };

    proto.advance = function (howMany) {
        ...
        this.trigger(proto.EVENT.SLIDE_CHANGE, { previous: previous, current: current });
    };
});
```

## Advanced Usage

### Upgrading Existing Elements

```html
<form is="m-async-form"></form>
```

```js
var MAsyncForm = M.extend('form', 'm-async-form', function (proto, base) {
    ...
});
```

### Extending Existing "M" Elements

```js
var MVideoModal = M.extend(MModal, 'm-video-modal', function (proto, base) {
    ...
});
```

### Cross-Module Communication

Previously, I gave an example of cross-module communication that'd be difficult to pull off with the current landscape of frameworks: an async-form in a modal that should cancel its current request if the modal is closed. This is some pseudocode to explain roughly how it'd be accomplished with Motherboard.

**HTML**
```html
<m-async-mediator>
    <m-modal>
        <form is="m-async-form">
        </form>
    </m-modal>
</m-async-mediator>
```

**JS**
```js
var MAsyncMediator = M.element('m-async-mediator', function (proto, base) {

    proto.createdCallback = function () {
        base.createdCallback.call(this);

        this.modal = this.getComponent(MModal);

        this.asyncForm = this.getComponent(MAsyncForm);

        this.listen(this.modal, 'close', () => this.asyncForm.cancel() );
        this.enable();
    };

});
```

## Polyfill Table

Motherboard uses APIs that aren't implemented in older browsers. While it can be polyfilled to work in IE9, desired browser support varies on a project to project basis. Therefore, all polyfills are included in the bower install, but it's left to your discretion which ones to include (if any).

|                                         | IE9       | IE10      | IE11      | Edge 20   | Safari 9  | Firefox 44    | Chrome 48   |
| ---                                     | :---:     | :---:     | :---:     | :---:     | :---:     | :---:         | :---:       |
| *webcomponentsjs/CustomElements.js      | Required  | Required  | Required  | Required  | Required  | Required      | -           |
| *matchMedia/matchMedia.js               | Required  | -         | -         | -         | -         | -             | -           |
| *matchMedia/matchMedia.addListener.js   | Required  | -         | -         | -         | -         | -             | -           |

<small>* - These will download to the bower directory when installing Motherboard via bower.</small>
