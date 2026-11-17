# Playground

Little interactive web toys, each in its own folder. On the site, Playground is a subfolder of the Prototypes window.

```
prototypes/playground/
  my-toy/
    index.html    Entry point. Served at https://cbuiocchi.github.io/prototypes/playground/my-toy/
    thumb.jpg     232x174 thumbnail for the Playground folder window (shown at 116x87).
```

Each folder holds everything its toy needs, so use relative paths. A toy should fill whatever size its window is (`100%` width/height, and redraw on `resize`), because it is shown in a window the visitor can resize.

## Toys

- **ball-pit/**: a canvas ball pit. Move the pointer into it to push the balls aside, hold the button to dive deeper, and let go to splash. It also has "+ Balls" and "Shake!" buttons. The physics is Verlet integration with a spatial grid for collisions; the tuning constants are near the top of the script.
