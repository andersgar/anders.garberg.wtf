# Automation Project: Water Tank Control

## System
An autonomous water-tank rig combining sensors, controllers, and simulation models to explore stable level control and fail-safe behavior.

## What’s Inside
- **Hardware:** Level/pressure sensors, actuated valves/pumps, safety relays, and an MCU/PLC controller.
- **Control:** PI/PID tuning for fill/empty cycles, anti-windup, and disturbance rejection under varying inflow.
- **Simulation:** Digital twin models for loop tuning and “what-if” tests before changing the physical rig.
- **Testing:** Integration checklists, alarm handling, and fallback states to prevent overflow or dry-run scenarios.

## Takeaways
- The value of simulation-first tuning before touching hardware.
- Clear separation between monitoring, control, and safety layers.
- Practical lessons on sensor noise, calibration drift, and keeping logs actionable.
