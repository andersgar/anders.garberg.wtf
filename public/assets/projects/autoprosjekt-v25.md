# Automation Project — Water Tank Control (Autoprosjekt V25)

This project implements and validates closed-loop control for a laboratory water-tank rig, combining practical PLC control with simulation and data-driven modelling. The control system is implemented in a PLC using Structured Text, centered around a discrete-time PID/PI-D design with key robustness features such as tracking/bumpless transfer, anti-windup, derivative filtering, and lead–lag feedforward for disturbance compensation.

To tune and evaluate controller performance before deployment, the project also establishes a simulation and test workflow by coupling PLC execution with Simulink through OPC communication. In parallel, system behaviour is modelled in MATLAB using system identification methods (including NLARX), supporting comparison between model predictions and measured response.

The final result is a documented controller architecture, a verified closed-loop setup, and a report that covers design choices, signal flow, tuning approach, safety considerations, and reflections from integration testing.
