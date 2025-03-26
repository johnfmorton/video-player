# FAQs during development

I've collected questions and answers I came upon during the development process of this workflow. I hope this will help others to understand the workflow better.

## Why does the tsconfig.json file have a "lib" option?

This is the bundled library declaration file. It is used to tell the TypeScript compiler what libraries are available in the browser. This is important because the TypeScript compiler will not allow you to use a library that is not declared in the "lib" option. For example, if you try to use the `fetch` function in your code, the TypeScript compiler will throw an error because it is not declared in the "lib" option. You can add the `fetch` function to the "lib" option by adding `"dom"` to the array. This will allow you to use the `fetch` function in your code.

## Why is "dom.iterable" in the "lib" option?

The `dom.iterable` option is used to tell the TypeScript compiler that the `NodeList` and `HTMLCollection` objects are iterable. This is important because the TypeScript compiler will not allow you to use the `for...of` loop on these objects unless you add the `dom.iterable` option to the "lib" option. For example, if you try to use the `for...of` loop on a `NodeList` object, the TypeScript compiler will throw an error because it is not declared in the "lib" option. You can add the `dom.iterable` option to the "lib" option by adding `"dom.iterable"` to the array. This will allow you to use the `for...of` loop on a `NodeList` object in your code.

Here's an example of how you might use dom.iterable to loop over the contents of a ul element:

```js
<ul id="myList">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

<script>
  const list = document.getElementById('myList');
  for (const item of list.children) {
    console.log(item.textContent);
  }
</script>
```

In this example, list.children returns a collection of li elements that are children of the ul element with the ID "myList". By using the for...of loop, we can iterate over each li element and log its text content to the console.

Note that not all HTML elements or collections support dom.iterable. To be iterable, an object must implement the Symbol.iterator method, which returns an iterator object that provides a way to iterate over the object's contents. You can check if an object is iterable by using the typeof operator and checking if it has a Symbol.iterator property.
