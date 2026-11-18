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
- **skee-ball/**: an arcade skee ball lane in 3D (Three.js from jsDelivr, like the coaster). Swipe (or drag) the ball up the lane; the speed of the flick sets how hard it rolls and the sideways part of the swipe adds aim, with a power meter beside the lane while you swipe. Keyboard: arrows aim, hold space to charge the meter. The ball climbs the ramp, flies, and scores wherever it lands on the tilted ring board (10 to 50, plus 100 corner pockets); too soft rolls back, too hard bounces off the back wall. The camera dollies in to follow each roll, the scoring ring lights up, and the spare balls wait in the return trough at the front. Nine balls a game; the game-over card lists every ball and counts up tickets (1 per 30 points). The best score is kept in `localStorage`.
  - Layout is in metres near the top of the script (`RAMP_*`, `BOARD_*`, `RINGS`, `CORNER`). The simulation's z runs away from the player; `V()` flips it into Three.js axes. The power curve is in `flickSpeed()` (`speed = 1.4 + flick * 0.45`); a speed of about 2.6 m/s lands in the 50.
  - `frameMachine()` fits the whole cabinet to any window shape (binary search on camera distance, then a lens shift to clear the HUD), and builds the closer "follow" pose from it.
- **coin-pusher/**: a coin pusher in 3D (Three.js). Tap or click to move the chute and drop a coin (hold to keep dropping; arrows + space on a keyboard). Coins land on the pusher's moving top, get scraped off its front lip by the back wall, and the pusher shoves the pile toward the edge. Coins off the front pay out into the prize tray (silver 1, gold 5, star 20, with confetti and a light show for the star); coins off the front corners, where the side walls stop, are lost. Your coin count *and the pile itself* are kept in `localStorage`, so reloading doesn't deal a fresh pile. There's a "+20 coins" refill when you run out.
  - Coins have no velocity: each frame the pusher moves and the overlaps are relaxed a few times, with coins touching the pusher pinned. `WALL_START` (the gutter length) and the gold/star odds in `dropCoin()` set the payback, which is a bit under 1:1 once the starting pile is gone.
  - Coins are drawn with one `InstancedMesh` per coin type, rebuilt every frame from the `shelf`, `top`, `dropping`, `falling` and `tray` lists.

Both games share a mute button (the `arcade-muted` key in `localStorage`); all sounds are synthesized with Web Audio.
