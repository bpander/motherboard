# Motherboard

Motherboard is a small (less than 3k gzipped), extensible foundation for client-side JavaScript applications.

## Origins

### Address Complex UI Behaviors

Angular, React, and similar frameworks are primarily concerned with updating views as data changes. A common problem encountered when building web apps is communicating between components, e.g. an ajax-form in a modal that should cancel its current request if the modal is closed. Motherboard makes it easy to implement an architecture to handle cross-module communication. 

### A Reaction Against Monolithic, Wheel-Reinventing Frameworks

Motherboard is meant to be a foundation to build on. It doesn't force a specific router or templating engine on you (and if you don't need one, don't use one). You can use whatever components are appropriate for your project. If one stops being good, you can easily swap it out for a different (better) one. This also helps keep page-weight down. This [TodoMVC app using Motherboard](http://bpander.github.io/motherboard-todos/) is only **7.3 KB** of JavaScript (gzipped and minified). By comparison, the AngularJS core gzipped and minified (just the framework) is 45 KB.

## Usage

### Custom Elements

Motherboard uses the [Custom Element API](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements) to directly tie an element to the UI component associated with it.

```js
var MCarousel = M.element('m-carousel', function (proto, base) {

    // All the lifecycle callbacks are exposed
    proto.createdCallback = function () {
        base.createdCallback.call(this);
        ...
    };

});
```

```html
<m-carousel></m-carousel>
```

### Custom Attributes

Motherboard includes a custom attribute API for easy configuration.

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
        });

    );
});
```

```html
<m-carousel id="one"></m-carousel>
<m-carousel id="two" autoplay delay="5000"></m-carousel>
```

```js
var one = document.getElementById('one');
one.autoplay; // false
one.delay; // 3000

var two = document.getElementById('two');
two.autoplay; // true
two.delay; // 5000
typeof one.delay; // "number"
```


### Responsive Attributes

Attributes can be flagged as `responsive` if their values should change depending on browser state.

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

var carousel = new MCarousel();
carousel.slidesVisible; // "(min-width: 768px) 3, 1"
carousel.currentSlidesVisible; // `3` if the viewport is wider than 768px, otherwise `1`
```

### Normalized, Intuitive, and Performant DOM Querying

```js
var MCarousel = M.element('m-carousel', function (proto, base) {

    proto.createdCallback = function () {
        base.createdCallback.call(this);

        // Gets the first child element with a matching `data-tag` attribute
        this.nextButton = this.findWithTag('m-carousel.nextButton');

        // Gets all child elements with a matching `data-tag` attribute    
        this.slides = this.findAllWithTag('m-carousel.slides');

    };
});
```

```html
<m-carousel>
    <ul>
        <li data-tag="m-carousel.slides"></li>
        <li data-tag="m-carousel.slides"></li>
        <li data-tag="m-carousel.slides"></li>
    </ul>
    <button data-tag="m-carousel.nextButton">Next</button>
</m-carousel>
```
**Note:** The {m-tag.propertyName} pattern isn't forced, it's just a convention I've found useful.

```js
var MSlideshow = M.element('m-slideshow', function (proto, base) {
    
    proto.createdCallback = function () {
        base.createdCallback.call(this);

        // Gets the first child element of the specified type
        this.carousel = this.getComponent(MCarousel);

        // Gets the first child element of the specified type and tag
        this.carousel = this.getComponent(MCarousel, 'm-slideshow.carousel');

        // Gets all matching child elements of the specified type
        this.carousels = this.getComponents(MCarousel);

        // Gets all matching child elements of the specified type and tag
        this.carousels = this.getComponents(MCarousel, 'm-slideshow.carousel');
    };
});
```

```html
<m-slideshow>
    <m-carousel></m-carousel>
    <m-carousel data-tag="m-slideshow.carousel"></m-carousel>
</m-slideshow>
```
