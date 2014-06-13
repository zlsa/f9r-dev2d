# BaseJS

_Focus on the program, not the JS._

BaseJS is a simple and light framework for managing common JS
requirements, such as asynchronous asset or script loading.

# Variables

## `MODULES`

For each JavaScript file you'd like loaded, just add its name relative
to `assets/scripts` (minus the `.js` extension) to the `MODULES`
variable. All of your scripts should be in `assets/scripts` to
minimize confusion. If the script name is preceded with a `-` (minus)
symbol, the callbacks (`module_init()`, `module_update()`, etc.) won't
be called and it will be treated as a normal JavaScript file included
via the `<script />` tag.

The callbacks will be run in the order of the files; if you've put the
`physics` module above the `input` module, `physics_init()` will be
called before `input_init()`.

## `VERSION`

Just an array of the version of the program. It's saved in the
property tree (under `prop.version` and `prop.version_string`) for
future reference (e.g. in an about dialog or such).

## `UPDATE`

The `UPDATE` variable controls the action after the callbacks
`module_init_pre()` through `module_ready()` have been called. If
`UPDATE` is `true`, a main loop will be started (with
`requestAnimationFrame()`) and the `module_update_pre()`,
`module_update()`, and the `module_update_post()` callbacks will be
called every frame. Do not call `requestAnimationFrame()` in any
`module_update()` callback; it's called automatically when every
module has called `module_update_post()`.

## `FRAME_DELAY`

The property `prop.time.fps` is averaged over this many seconds; the
higher `FRAME_DELAY` is, the less framerate spikes will be visible.

## `RELEASE`

If `RELEASE` is `true`, the maximum log level is `LOG_WARNING`;
otherwise, it's `LOG_DEBUG` (which logs everything).

# API

## `log(message,level)`

Logs `message` to the console; prepends `[ <level> ]`, where `<level>`
is the latter part of `level`, which can be one of the following:

* `LOG_DEBUG`
* `LOG_INFO`
* `LOG_WARNING`
* `LOG_ERROR`
* `LOG_FATAL`

For example, calling:

    log("this is a debug message",LOG_DEBUG);

would print out

    [ DEBUG ] this is a debug message

Note that none of the log levels do anything besides print out the
message (meaning `LOG_FATAL` will not do anything besides print out
`[ FATAL ] oh no, something died`).

## `time()`

Just returns the time in seconds, with millisecond
precision. Equivalent to `new Date().getTime()*0.001`.

## `s(number,single,multiple)`

If `number` is `1`, return `single`; otherwise, return `multiple`. If
`single` and `multiple` are omitted, `single` defaults to `""` and
`multiple` defaults to `"s"`. It's intended to be used as an easy way
to handle user-defined numbers and avoid the awful "You have clicked
the button 1 times!" message.

Usually used as:

    "You have clicked the button "+number.toString()+" time"+s(number)+"!"

## Callbacks

For each module (defined in the `MODULES` list above) without a `-`
before the name, there are some callbacks that are called if
there. Replace `module` in the following lists with the name of the
module (for example, `physics_init()`). These callbacks do not have to
be defined, but if they're there, they will be called at every
frame. Watch out for functions accidentally named `???_update()`.

* `module_init_pre()` is the first callback. It is called immediately
  after all scripts have been loaded and the property tree has been
  set up.
* `module_init()` is called immediately after `module_init_pre()`.
* `module_init_post()` is called immediately after `module_init()`.

After all modules have finished with the init callbacks,
`module_done()` is called. If there are any asynchronous callbacks
waiting, they are all blocking the `module_ready()` callback;
`module_ready()` will only be called after all asynchronous blocks
have been lifted with `async_loaded()`.

The callback `module_resize()` is also called at least once during
init and also every time the window changes size.

When `UPDATE` is `true`, the functions `module_update_pre()`,
`module_update()`, and `module_update_post()` will be called in that
order every frame.
