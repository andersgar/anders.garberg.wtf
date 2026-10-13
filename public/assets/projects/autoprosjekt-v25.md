# Automation project: water tank control (Autoprosjekt V25)

Group project in 2025, part of a lab course in the bachelor's programme. The task was level control of a laboratory water tank rig, and the point was to do the whole chain properly: controller, simulation, model and report.

## The controller

The controller runs in a PLC, written in Structured Text: a discrete-time PID/PI-D with tracking and bumpless transfer between manual and automatic, anti-windup, a filtered derivative and lead-lag feedforward to compensate for disturbances.

## Simulation and modelling

To tune the controller before touching the rig, we connected the PLC to Simulink over OPC and ran the loop closed in simulation, with the tank modelled in Simulink. In parallel we modelled the tank in MATLAB with system identification (including NLARX) from measured data, and compared the model's predictions with the measured response.

## Delivery

The controller, a verified closed-loop setup and a report covering the design choices, signal flow, tuning, safety considerations and what we learned from integration testing.
