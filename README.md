## Stealify Lang 
Stealify will get its own coding language based on graaljs & graalvm language tooling a SuperSet of TypeScript/ECMAScript. with Opinionated Behavior and features.
It can transpil down to Polyglot ECMAScript2023+ that means that the resulitng Artifacts will get splitted into ECMAScript Code and binary execute able libs that are call able by the targeted Execution Environment.

It also offers tooling to package and bundle the build artifacts with diffrent distribut able execution environments like. VirtualMachines, Containers to directly deploy run and test your app on the target machine no matter if it is a Cloud or your Local PC.

It contains advanced Analyzers and Build Optimization API's to develop Autonomous Self Tuning Software.

While Stealify Lang offers the Whole Feature Set most of the tooling is designed to even work standalone and can be composed based on project needs
that allows you to incremental migrate your Projects to Stealify.

# Tooling
Run Convert Integrate ECMAScript Code with Binary Polyglot Modules to Create Desktop and Mobile Apps for Any OS in Less Time. 

Stealify Offers the needed tools to Create Cross Platform Applications and Server Services.

The Main Repo stealify/stealify holds example Stealify App Wrappers for diffrent Operating Systems they got created with the @stealify/sdk and the example app is the stealify manager.

Stealify did Power the @open-pwa/open-pwa project the open-pwa installer is also build with the @stealify/sdk
now it gets mainly used to create tooling for the Web 4.0 https://github.com/internet-of-presence/IoP

## Stealify Academy 
- Why do i need rust? For buissnes critical Processing this is the ideal lang as it gives you enough constrains and build hints
  - Later versions of Stealify Lang will use more and more rust code as also more and more wasm code.
- why do i need to learn Java? Because it is used by Android and that means you can not circumvent to get Familar with it. Sure you can delay that and even create Software without knowing Java at all but you will reach Edge Cases where Java can save you a lot of time and headache. You only need it to Implement Bindings to other languages for your ECMAScript code it is also most time Relativ Familar for a ECMAScript Typescript or Stealify Developer.
- Learn about Cross Platform development "the good parts"
- How to use JavaScript EcmaScript with Syntax and Code hint support aka TypeScript & Language Server Protocol Internals and Secrets.
- In deepth Bindings and low level Informartion about Interop Magic as also Abstraction Patterns for Code Reuse.

## language-integration-tooling
  - stealify-ecmascript-php (run php as js);
  - stealify-ecmascript-python (run python js);
  - stealify-ecmascript-go (run go js);
  - stealify-ecmascript-java (run java as js);
  - stealify-ecmascript-graalvm-truffle-adapter (run stealify-ecmascript-ast's inside graalvm);

## Stealify lower the barrier of using v8::Isolates
Cloudflare and other big companys are using them already but there exists no opensource Equivalent at present so stealify fills the gap. 
with the offered Software Encapsulation Tooling including fast isolates SDK based on the amazing just-js Project. It Includes a V8::Isolates SDK to create ECMAScript written System Tooling for linux as single file binary.

# Stealify should get a Collection of Tooling Best Practices to Create and Compose Software with ECMAScript glue Code
For Example our Installer for the SDK is build with the @stealify/sdk

# Most Current Stack
- https://github.com/stealify/rust-tooling
- https://github.com/stealify/graalvm-tooling
- https://github.com/stealify/ecmascript-tooling We should migrate the modules and stuff from this main repo to that tooling repo
- https://github.com/stealify/rust-interop
- https://github.com/stealify/graalvm-nodejs-interop
- https://github.com/stealify/graalvm-nodejs-context

## About NodeJS
NodeJS aka node is written in C and has Methods to Call C, .node(C using Node ABI), .wasm
the node-graal version is a fork that is written in C that can additional also call into GraalVM as it uses the GraalVM ECMAScript engine as replacement for V8

## About GraalVM
graalvm (Stack) is a JVM based Polyglot Stack to translate polyglot code into Javabyte code and Run Compile Optimize it

## About Rust
Rust is one of the Most Solid Languages as it needs no Garbage Collector and has a safe Memory Management system by design. It can be used to Create Modules for GraalVM and or NodeJS. It is Also Able to Embedded both but that would add none needed overhead.

Possible Solutions
- node-rs (Rust bindings for Node ABI) => .node modules
- LLVM (GraalVM)
- wasm
- shared object build .so
- neonbindings => .node module
- uvm......

# Stealify Incubator for @direktspeed/vmpack & vmdeploy & @open-pwa
Stealify is a Framework to adopt Software it is a Rockstar Unicorn Project all stable results will be supplyed and rebranded to @direktspeed/vmpack @direktspeed/vmdeploy and @open-pwa/open-pwa as also the Commercial ***Stealify Cloud - the First Cloud agnostic Cloud aka deployless serverless platform***

it aims to provide a uniq interface for fast adopting developing production deploy and production serve your apps and servers or apis.
Stealify has a strong focus on Productivity it enables that via Automated Codemodification if needed to make existing Software compatible to a new App with a other api or other needs.

First lets lookup the term stealify in a dictionary: Stealify - To steal something in sense of doing really awesomely.

It is a Framework to Create Software that is Environemnt, Platform and even Language Agnostic.
it also aims to provide methods and tools for fast adopting developing production ready Applications that Run on Petrabyte Scale.

<hr/>

## Stack
- GraalVM-ce-21.0 with JDK15 and JDK 8, 11 Compatibility also includes version manager
- NodeJS 16 Latest with JDK15 and JDK 8, 11 Compatible bindings to GraalVM
- NWJS Latest NodeJS and Chromium with JDK15 and JDK 8, 11 Compatible bindings to GraalVM
  - Yes! Chromium with NodeJS bindings to GraalVM It is used for the Main @open-pwa/open-pwa/platform distribution also stealify/platform/desktop
- Consistent JS API between NodeJS and GraalJS and node-graalvm JDK15 and JDK 8, 11 Compatible bindings to GraalVM and a GraalJS-node implementation
- Perfect Javascript & Java Interop in any Scenario on any Device.
- Automatic AI driven Deployment Optimization of your code at runtime via AI driven Deployment Processes
- nodejs-mobile

## Some examplesExtras
- https://github.com/gluonhq/maps
- gluon mobile with universal adapter https://bitbucket.org/gluon-oss/charm-down
- cordova
- couchbase & couchbase sync support 
- apache ignite support.
- vertx

## TODO:
Make distributions:
- desktop
- server
- addon installer


## Internals Roadmap

- /stealify (lib with java tools) [A Uniq Java Interface for all Languages with a module system]
- /ECMAScript/  (JS polyfills)
- /PHP/  (PHP polyfills)
- /RUBY/  (RUBY polyfills)
- /PYTHON/  (PYTHON polyfills)
- /quarkus (nativ build extension for stealify)
- /vertx (async eventloop)
- /pm
- /cli
- /build
- /develop
- /docs



- [ ] GraalVM (Profiling Analyze Execute Security Low Level)
  - [ ] Quarkus (Profiling and Compile Tooling High Level Packaging to Nativ Binary and Incremental Builds)
  - [ ] ECMAScript / JavaScript Stealify (Collection of Modules and Parts Bindings)
    - [ ] Stealify
    - [ ] jscodeshift
    - [ ] codemod
    - [ ] rollup
    - [ ] webpack
    - [ ] typescript
  - [ ] NodeJS Compatible HighPerformance Context ECMAScript Runtime
  - [ ] Eclipse Vertx Async Framework (JAVA)
- [ ] - Stealify CLI tooling 

## Stealify build on the Sholders of Giants
Last Release Java EE 8 now Eclipse Foundation Jakarta EE MicroProfile Project for example

## Core Components
ECMAScript based Components of Stealify 
- Codemods (Collection of Code optimizations including runner)
- bundler (rollup-enterprise + plugin collection)
- loader (rollup-enterprise + systemjs)
- tooling (All kind of tools to analyze code and detect Problems)
- patterns
- jscodeshift
- codemod
- lebab tranformed to get executed via jscodeshift as codemod.
- rollup-enterprise

## Core Integration Points for JS / ES / Javascript / ECMAScript

### WASM + WASi + WASMVM(Runtime)
gu install wasm !!!
The Future is to run wasm + wasi on the server and the client while use JS / ECMAScript as high-level language. That will allow Polyglot Programming at its best. we need everything in wasm and optimize the existing Runtimes.

Wasi can be a new containerisation approach but running on mobiles, desktops, IOT and servers. It solves is able to solve a fundamental problem of trusting code from someone else with the host deciding what file / network IO the third party code has access to.
Sort of like how android will prompt you when an app wants to access your contacts or file system.

Java Rust and Go are good source starting languages to create wasm.
- Rust is perfect implamented via wasmer.io it also is go compatible
- Go is on it's way https://github.com/golang/go/issues/31105
- NodeJS has wasm support and offers wasi
  - parcel also covers rust well.

### GraalVM Runtime 
GraalVM is a universal virtual machine for running applications written in JavaScript, Python, Ruby, R, JVM-based languages like Java, Scala, Clojure, Kotlin, and LLVM-based languages such as C and C++. It also offers a Substrate VM Layer that allows compiling AOT to binary executeable.

The Graal Framework provides tools for creating language-agnostic tools like debuggers, profilers, or other instrumentations. In general, it provides a standardized way to express program code enabling cross-language research and the development of tools that are developed once and then can be applied to any language. As also aims to have some of the fastest Runtime Implamentations for many languages like Javascript driven Webservers.

## Why ECMAScript / ES6+ / Javascript / Node is focused?
Because it has proven that it is one of the best languages when it comes to massured coder productivity.
It is a language that many people can learn and understand easy they are able to produce valueable running prototypes
in less time. Also near any Software today is a Distributed System that offers a Webinterface or App so you will have at last one Javascript coder around in Any Project! And at all Stealify Concepts and the Main Installer are Polyglot so it is still useable It is a GraalVM based Framework while Parts or lets even say modules of it can be used even also directly with any Other Environment like the browser with a diffrent Runtime like v8 or Chakra, Spidermonkey.

It is out of our view the most versatile highlevel language.

# a Comic Description
![DID IT](https://www.commitstrip.com/wp-content/uploads/2020/01/Strip-Framework-malgr%C3%A9-soi-650-finalenglish.jpg)

![DID IT](https://www.commitstrip.com/wp-content/uploads/2019/03/Strip-Seuls-dans-lunivers-650-finalenglish.jpg)

![Your Language Sucks](http://www.commitstrip.com/wp-content/uploads/2015/12/Strip-Le-langage-de-la-discorde-V2-650-finalenglish.jpg)

## Patterns
Based on Enterprise Integration Patterns (EIP) to help you solve your integration problem by applying best practices out of the box. Stealify supports the Enterprise Integration Patterns from the excellent book by Gregor Hohpe and Bobby Woolf, and newer integration patterns from large scale distributed microservice architectures.

## Short Why?
- Faster Development
- Better Controle over the execution
- Security
- Reduced Operational Costs
- Build to Last principles via modular software encapsulation!

## Stealify the Software encapsulation Framework Concept
Software Stacks today are composed out of many software products and connected via the network that is a hugh problem to maintain and run efficently Stealify is about encapsulation so it creates Software Products that are build out of other Software Products and abstracts away the network overhead it enables to design or lets say Compose Software out of Many Products to define the behavior of your Software. Maximum code Reuse and Security paired with unparalled Productivity that was not possible before are only 3 of the endless features that you get on this way for free. It will change the way you code and design Software total.

It allows you to Combine your Javascript code with a low level language like wasm or Java so you could let your Javascript code use The best parts and tools from the low level language Ecosystem with the Power of a Scripting Language like Javascript fully flexible run able embbeded, standalone or even Compiled to a single optimized binary.

Stealify aims to solve the biggest Problems of the NodeJS Runtime the creator of it rayn dahl did a talk 10 things i regret about NodeJS. like beeing tied to npm, like gype and c bindings hell, security. Read the full story and how all this is addressed.[Here is a Link to a Story about that](#)

The Documentation aims to be a Complet Software Development Guide for Coding Highperformance Applications and turn them into complet automated Autonomous Systems that take autark decissions for error handling and operations.

## What is It for?
- event-driven automation for auto-remediation, security responses, troubleshooting, deployments, and more. Includes rules engine, workflow, 2M+ integrations
- Generate Reactive Server and Client Side Applications and Manage/Monitore them from Dev to Production.
- Reduce Security Risks via our Unikernel Tools to use Only what you Really Need and don't add extra Security issues.

## What is It not for?
- We are not aware of a single usecase that would not fit into this. You are free to submit issues.

## What is it more exactly?
A Framework and Essential tooling for A high performance implementation of the JavaScript programming language. Built on the GraalVM Framework by Oracle Labs. That Supports Node.js applications, including native packages. Offering Complet Application SDK's for Reallife Usecases that is Full compatibility with the latest ECMAScript specification as also Executes JavaScript code with best possible performance. It Allows simple upgrading from Nashorn or Rhino based applications via Fast interoperability with Java, Scala, or Kotlin, even with other GraalVM languages like PHP, Ruby, Python, or R. the whole implamentation and your software will also be Be embeddable in any systems like IoT, Databases for example Oracle RDBMS or MySQL. Any Mix is possible.

# How it Works?
- Its minimalistic
- It has a big Ecosystem the biggest in the world as its able to adopt Ecosystems :)
- Its build to last. So it saves Investments.

- Works with any Software on Any Operating System.
- is used on DIREKTSPEED OS - Server which got now OPEN-PWA the Infrastructure Manager using nils+stealify to supply imutable Infrastructures and Manage Complet Infrastructure and Application LifeCycles for Production and Development

# Examples
- React to estscm
- Angular to estscm
- Angular2 to estscm
- CanJS to estscm
- jquery to estscm
- Guide CodeMods
- Guide rollup-enterprise
- SystemJS (Supply modules for Workers and Other None Module Environments why using Module Patterns)

Stealify is created and maintained by Frank Lemanschik, which offers enterprise versions of them that includes advanced features for security, compliance, multitenancy, networking and storage, and is backed by 24x7, SLA-governed support. For more information about  Enterprise Solutions and Products, please visit https://dspeed.eu 
=======
- Works with any Software on Any Operating System via Nativ code so you can Code Cross Plattform.
- Stealify is like the Bible for Developers and Operators as also everyone that is Tech Interrested.

## The Core Stealify Components
- wasmer-js
- rustwasm
- rust
- parcel
- graaljs - A ECMAScript 2012 compliant Javascript implementation built on GraalVM. With polyglot language interoperability support. That is 100% NodeJS Compatible.
- graaljs-bindings-vertx - A async reactive Java Programming framework offering 
- graaljs-bindings-atomx - A async reactive Java framework for building fault-tolerant distributed systems.
- graaljs-bindings-apache-ignite - A in-memory computing platform used for transactional, analytical, and streaming workloads, delivering in-memory speed at petabyte scale.
- graaljs-bindings-apache-zookeeper
- graaljs-bindings-embedded-grafana

# Get it?
On Linux 
```bash
mkdir my-project
cd my-project
wget 
``` 
Via Docker

## Example usecases
- Running Gitlab More Performant
- Running K8S at high scale with less overhead
- Realtime Chat Applications
- Custom Databases with Javascript logic
- Speed up existing Database deployments with additional logic
- Drop In Replacement for many Open Source Software Implamentations that is more flexible
- Creating Hosting or Serverless function Platforms
- Create diffrent types of Applications like SaaS PaaS IaaS
- embed your scaling, and failure handling logic into your application without extra services.

## Anti Patterns
- Inharitance is not for code ReUSE Functions are for reuse and Class Composition are for reuse. Mixins are not really for reuse 
- Using require is a code smell for old code use import that is static analyzeable and brings instand improvements.

## TODO
- Make Realtime more easy
- Finish PHP Integration
- Many Many tutorials
- Browser behavior and api's
- Showing Application distribution Patterns
  - Introduce direktspeed permissions concept of a shared OS binding platform for all apps. Its a solution for API's that chrome does not has finished yet.


Stealify & NilsJS is created and maintained by Frank Lemanschik, which offers enterprise versions of them that includes advanced features for security, compliance, multitenancy, networking and storage, and is backed by 24x7, SLA-governed support. For more information about  Enterprise Solutions and Products, please visit https://dspeed.eu.

