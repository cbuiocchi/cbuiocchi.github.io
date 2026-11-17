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
- **roller-coaster/**: a small 3D coaster (Three.js, loaded from jsDelivr). Press "Ride!" to board: the train is chain-lifted up a 32 m hill, drops at about 85 km/h into a teardrop vertical loop, then runs a banked turnaround, a zero-g roll, a camelback airtime hill and a double corkscrew (four inversions) before braking back into the station. The HUD shows speed, height and the G-force at the rider's seat (about 4.9 G at the bottom of the drop, -1 G over the camelback). "View" cycles front seat / chase / overview, and dragging looks around.
  - The layout is the `CONTROL` point list (a closed Catmull-Rom spline); `loopPoints()` builds the loop and `ROLLS` lists the heartline rolls.
  - Track frames are rotation-minimising (so "up" follows the track through the loop), corrected back to world-up-plus-banking wherever the track is upright. Heartline rolls twist the track around a line at rider height.
  - Heights are lightly smoothed outside the loop to keep valleys and crests from spiking the G-forces; if you edit the layout, keep an eye on the G readout.
