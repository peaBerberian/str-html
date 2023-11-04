# str-html

`str-html` is a fast and lightweight JavaScript UI library relying on
JavaScript's [tagged template literals feature](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

It basically allows writing HTML in JS (like JSX) without the need of a
separate transpilation step (unlike JSX) nor of an heavy library, everything
being handled natively by JavaScript's tagged template features:
```js
import strHtml from "str-html";

// Create a simple HTMLElement by just writing its HTML content
const someInnerHtmlElement = strHtml`<p>Click Me!</p>`;

// `someInnerHtmlElement` is now a regular `HTMLElement` object:
someInnerHtmlElement.onclick = () => {
  // Dynamically appending new elements
  document.body.appendChild(strHtml`<p>Clicked!</p>`);
};

// We can also insert template expressions in that string
const myAttributeValue = "foo";
const someClassName = "some-class";
const someTextToEscape = "<script>alert();</script>"
const myElem = strHtml`<div class="my-class" attr2=${myAttributeValue}>
  ${someInnerHtmlElement}
  Some example text.
  <div>Inserted expressions are escaped: ${someTextToEscape}</div>
  <span class="some-other-element ${someClassName}">Even ${"more"} text.</span>
</div>`;

document.body.appendChild(myElem);
// HTML body content now:
// <div class="my-class" attr2="foo">
//   <p>Click Me!</p>
//   Some example text.
//   <div>Inserted expressions are escaped: &lt;script&gt;alert();&lt;/script&gt;</div>
//   <span class="some-other-element some-class">Even more text.</span>
// </div>
```
_[Run that example in your browser](https://codesandbox.io/s/hungry-worker-ljm2vz?file=/src/index.mjs)_

The goal of this library is to be a much lighter weight and faster solution for
projects where you wish for an HTML/JSX-like syntax without the need of a big
UI framework. With `str-html`, the dependency size, API, heavy library logic and
complex library behaviors are all kept to a minimum allowing you to just write
your own UI in a readable manner while relying on known native HTML concepts.

Note that the template string expression's placements are properly checked by
`str-html` and sanitized by relying on the browser's API, so security worries
can be kept to a minimum - at least like with regular JSX and the JS HTML API.

## Quick examples

You can install `str-html` from npm/yarn:

```sh
npm install str-html
```

Or just copy-paste the `./main.mjs` file in this repository's root in your
project.

You can then just write HTML directly as a template string, prefixing it with
`str-html`'s main export:
```js
import strHtml from "str-html";

// Simply declare an element by writing its HTML.
const myElement = strHtml`<div class="my-div"><p>Some paragraph</p></div>`;

// `myElement` is now a regular `HTMLElement`. Let's add it to the DOM.
document.body.appendChild(myElement);

// You can do any usual task with `HTMLElement`s, let's register an onclick
// handler:
myElement.onclick = function (evt) {
    // do things with it
    console.log("Received click event", evt);
};

// We can also dynamically update its text content like usual
myElement.textContent = "Some other text";
```

`str-html` also allows to insert attributes and the inner content of elements
through expressions:
```js
import strHtml from "str-html";

// Attribute values and element inner contents can be declared as
// "${expression}" in which case they will be properly sanitized.
//
// You can also put newline/whitespaces where authorized by HTML.
const className = 'class1 class2 classWithAQuote"3';
const textContent = "Some text with <> characters";
const anotherElement = strHtml`<div class="some-outer-element">
  <div class=${className}>
    ${textContent}
  </div>
</div>`;

// You can insert an element in another element like this
const myElement = strHtml`<div class="some-class">Some initial text</div>`;
const parentElt1 = strHtml`<div class="parent-element">${myElement}</div>`;

// You can also concatenate multiple values by relying on an array
const parentElt2 = strHtml`<div class="parent-element">
  ${[myElement, anotherElement]}
  You can even add some text before of after or in the array, as you wish
</div>`;

// That's it, you know how to use it now!
```

## API

The ultimate goal of this library is to be very simple to understand.
No magic (well, tagged template literals are kind of magic, but you get my
point), and all HTML rules applies for the rest of your application.

The only rules to understand with this library are that in `str-html` template
litterals:

1. At least for now, CDATA sections, HTML comments and DOCTYPE HTML features are
   not supported.
   If any of the unauthorized elements is detected, `str-html` will throw.

   If you don't know what some or all of those are, you probably don't use nor
   need them.

2. An `${expression}`:

   1. Can only be set as an attribute value and inside an element's content.

      This is enforced by `str-html`, which will throw if an expression is
      found elsewhere.

      Note that you can put in both of those places multiple ${expression}
      and strings concatenated and interpolated, in which case it will
      behave like you may suspect: concatenated and interpolated.

      Example:

      ```js
      console.log(
          strHtml`<div class="${"class1 "}class2 class3${" class4"}" />`
              .outerHTML
      );
      // Outputs: "<div class="class1 class2 class3 class4"></div>"
      ```

   2. Will behave differently depending on the type found in the expression:

      - `null` and `undefined` will be translated to an empty string.

      - `HTMLElement`, will be appended as a child element when set as another
        element's inner content.

      - `str-html` will throw if an `HTMLElement` is set as an attribute's
        value (why would you do that?).

      - any other values but an array (see below) will have its `toString`
        method called on it and its result will be first sanitized then
        used.

      - An array.
        Same rules than for the corresponding single values, but repeated
        for each element of that array. From the first to the last item of
        that array. The obtained results are then concatenated.

That's it!

## About void elements

Some elements, like `<br>` or `<input>` cannot have an inner content as per the
HTML spec and do not need/have a closing tag, those are called
["void elements"](https://html.spec.whatwg.org/#void-elements) in HTML linguo.

In `str-html` they have been handled as is the more logical for library users:

-   The HTML-compliant way of declaring one without closing it is supported,
    you can picture it as if a closing tag was automatically added just after
    its opening tag.

-   If you put content inside a void element, it will be actually added to its
    parent element, exactly like if you did the same thing on a browser with
    the `innerHTML` API (at least on browsers I checked).

-   Closed void elements are just skipped

This should lead to a sensible way of handling them regardless of your
preferences. For example, with `<br>`, any of those will be parsed the same
way:

```js
strHtml`<p>first line<br>second line</p>`; // HTML way
strHtml`<p>first line<br/>second line</p>`; // Self-closing way
strHtml`<p>first line<br></br>second line</p>`; // Second closing tag
strHtml`<p>first line<br>second line</br></p>`; // User may have not understood `<br>`
```

## Is it fast?

It should be pretty fast and faster than most heavier UI libraries.
However I have no idea how much as I wasn't bothered yet to bench it.

It does has some overhead over native browser APIs due to the string parsing
involved.
For places where you really need the toppest performances, a huge advantage of
`str-html` is that, because it just outputs an `HTMLElement` and can read them,
it is possible to combine it with the fastest framework available: native
browser APIs!

For example, you can do:

```js
// Declare 1000 HTMLElement with native browser API
const elements = [];
for (let i = 0; i < 1000; i++) {
    const element = document.createElement("div");
    element.className = "some-class-name";
    element.textContent = `Some text content for ${i}`;
    elements.push(element);
}

// Include them in a `str-html` template to produce a parent HTMLElement in a
// more readable way.
const parentElt = strHtml`<div class="parent-elt">${elements}</div>`;

// And the other way arround, include `parentElt` in a element created through
// native browser API
const wrapperElt = document.createElement("div");
wrapperElt.appendChild(parentElt);
```

Again, maybe it turns out that `str-html` is already very fast for your need,
it is for mine at least.

## How do I declare a data binding?

You don't, that's what's beautiful!

`HTMLElement` produced by `str-html` are not dynamic: they produce an
`HTMLElement` which corresponds to the values declared in it at this instant,
you can just picture it like a regular JS template literal.

If you ever want to update one of this HTMLElement's content, just use regular
browser API:

```js
let counter = 0;

// Put the current value of counter in an element
const counterElt = strHtml`<div>${counter}</div>`;

counter++; // we increment the counter, now set to `1`

// `counterElt` still contains `0` right now, but to update it you can just do:
counterElt.textContent = counter;
```

Note that an `HTMLElement` added through `str-html` keeps the same original
reference:

```js
let counter = 0;
const counterElt = strHtml`<div>${counter}</div>`;

// `parentElt` will contain `counterElt`
const parentElt = strHtml`<div>${counterElt}</div>`;

// Update `counterElt` even inside `parentElt`
counter++;
counterElt.textContent = counter;
```

## I want to add interactions to my element

Just rely on usual HTML event handlers:

```js
const mySuperButton = strHtml`<button class="my-button">Click me</button>`;
mySuperButton.onClick = () => {
  mySuperButton.textContent = "You clicked!";
  alert("Great job!");
};

// Note that you can just target an inner element through the usual HTML API
const myElementWithAButtonInside = strHtml`<div>
  <button class="inner-button">Click me</button>`
  <div class="some-other-huge-inner-div-I-dont-want-to-listen-to-for-clicks" />
</div>`;
const innerButtonElt = myElementWithAButtonInside
  .getElementByClassName("inner-button")[0];
innerButtonElt.onClick = () => alert("Done!");
```

## Why not allowing expressions everywhere?

Technically, it wouldn't be hard to also allow it as element names and
attribute names, or even as a collection of attribute names and values, but I
found that it complexified too much the API for something I don't really
need.

My opinion may change in the future if I need this.

## Why not adding a simple notion of components?

After some initial considerations, I think [HTML custom
elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
already answer that need, so you might consider them.

Though, `str-html` is not React, if you really need custom component, dynamic
updates and complex state management, you may want to look-up for another more
complete solution.
