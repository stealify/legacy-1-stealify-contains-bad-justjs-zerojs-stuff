Writing Docs
============

Tips and templates for writing `@most/core` docs.

Combinator template
-------------------

> **note**

> Template for writing docs for an API function.
>
> 1.  Copy and paste into appropriate enclosing doc (probably api.rst)
> 2.  Complete each todo
> 3.  Make sure all todos have been removed before pushing

### name

``` {.sourceCode .haskell}
name :: (a -> b) -> Stream a -> Stream b
```

Short description of what it does. Usually just 1-3 sentences, but may
be multiple paragraphs if needed.:

> stream: -a-b-c-d-\> map(f, stream): -f(a)-f(b)-f(c)-f(d)-\>

Add more explanation *only if necessary*. Otherwise, just delete this.

``` {.sourceCode .javascript}
map(x => x + 1, stream)
```
