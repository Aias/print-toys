import{j as e,w as h,r as u,u as m,F as g}from"./chunk-JMJ3UQ3L-BilMNg9t.js";import{B as i}from"./button-BzO9OnCD.js";import{c as p}from"./utils-CDN07tui.js";function x({className:n,...t}){return e.jsx("textarea",{"data-slot":"textarea",className:p("border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-none border bg-transparent px-2.5 py-2 text-xs transition-colors outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1 md:text-xs",n),...t})}const b=`
# A Pattern Language

A **book** by Christopher Alexander, Sara Ishikawa, and Murray Silverstein.

> This is a fundamental view of the world. It says that when you build a thing you cannot merely build that thing in isolation, but must also repair the world around it, and within it, so that the larger world at that one place becomes more coherent, and more whole; and the thing which you make takes its place in the web of nature, as you make it. - [Source](https://en.wikipedia.org/wiki/A_Pattern_Language)

## Connections

Connections are either **direct** (children) - found within the book - or **indirect** (related) - found outside the book.

### Children

1. *One* Its place in the web of nature
2. *Two* Scattered work
3. *Three* Four-story limit

### Related

- Deliberate acts
- patternsof.design
- 125 best architecture books
- The Timeless Way of Building

## Summary

At the core of *A Pattern Language* is the philosophy that in designing their environments people always rely on certain 'languages', which, like the languages we speak, allow them to articulate and communicate an infinite variety of designs within a formal system which gives them coherence.

\`\`\`
var x = 10;
  console.log(x);
	  x = 20;
\`\`\`

---

Christopher Wolfgang John Alexander (4 October 1936 – 17 March 2022) was an Austrian-born British-American architect and design theorist.`,w=`
This is an image.

![photo](https://cdn.glass.photo/a70yd1tLEaKFHA58b6IJLXv0mje8rejx0V2kZLkgaWI/rs:fit:1024:1024:0/q:90/L3Bvc3QvNjg0YzZiMzktNTEwNy00N2QzLTljMmEtN2FkODNjMWI5YjZhL3Bob3Rv)
`,l={method:"post",encType:"text/plain"},y=h(function({actionData:t}){const[r,d]=u.useState(""),s=m(),c=a=>{a.preventDefault(),s(r,l)},o=a=>{s(a,l)};return e.jsxs("div",{className:"mx-auto max-w-[720px] p-4",children:[e.jsx("h1",{className:"mb-4 text-2xl font-bold",children:"Notetaker"}),e.jsxs(g,{onSubmit:c,className:"mb-8 space-y-4",children:[e.jsx(x,{name:"markdownText",value:r,onChange:a=>d(a.target.value),placeholder:"Type your note in Markdown format",className:"h-64"}),e.jsx(i,{type:"submit",className:"w-full",children:"Print Note"})]}),t&&e.jsx("p",{className:`mt-4 ${t.success?"text-green-600":"text-red-600"}`,children:t.message}),e.jsxs("div",{className:"mt-8",children:[e.jsx("h2",{className:"mb-4 text-xl font-semibold",children:"Test Prints"}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsx(i,{onClick:()=>o(b),variant:"secondary",children:"Test Pattern Language"}),e.jsx(i,{onClick:()=>o(w),variant:"secondary",children:"Test With Image"})]})]})]})});export{y as default};
