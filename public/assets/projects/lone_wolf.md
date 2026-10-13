# BSc thesis: Lone Wolf synthetic test environment (spring 2026)

Bachelor's thesis written with KONGSBERG Land Systems, January to June 2026, in a group of four. Grade A. The task was to make the Lone Wolf autonomy stack easier to develop and test without constant access to the physical vehicle. The result is a test environment in NVIDIA Isaac Sim for the planned Lone Wolf UGV.

## What it does

The environment uses the same ROS 2 interfaces as the real robot (/clock, TF, topics), so the same autonomy software runs against the simulator and the vehicle without changes. Scenarios are defined once and can be run again and again, and the loop can be closed, with the autonomy software driving the simulated vehicle and getting simulated sensor data back. Robot assets, sensors and payloads are modular, so one configuration can be swapped without rebuilding the rest.

## My part

I built the Isaac Sim extension, in Python, on top of the simulator's own ROS 2 bridge. It loads the robot's URDF and USD models, sets up the sensors (RGB-D camera, lidar, IMU and odometry), wires up the ROS 2 graph and has a GUI inside Isaac Sim where the user picks a scenario and adjusts it before running.

## Validation and use

We validated the environment against measurements on the physical robot: the odometry response matched, and the depth data from the camera was consistent with the real sensor. The 2026 summer team used the environment in their development, so new software could be tried in simulation before it went on the vehicle.

The thesis is registered in the Norwegian national research archive: [publication record at Sikt NVA](https://nva.sikt.no/registration/019fdbfa5b5b-f2a75d0c-5d47-4efa-a779-18a72d807721).
