# Lone Wolf 2026: operator panel and vehicle link (KONGSBERG)

Summer internship at Kongsberg Defence & Aerospace, Land Systems, June to August 2026, in an eight-person intern team. Lone Wolf is KONGSBERG's recurring summer-intern project: an unmanned ground vehicle built on the Husarion Panther, which each year's team takes a step further toward autonomous navigation, drone tracking and remote operation from a dedicated command station.

My seat was Software/ICS: the operator panel and everything between it and the vehicle.

- **Operator panel (ICS).** A C++/Qt application with native video rendering, chosen over a web stack to keep latency down for teleoperation. Pages for driving, turret control, map, system health and a multi-vehicle overview. Joystick, gamepad and keyboard input with automatic device selection, and a dead-man switch that stops the platform the moment it is released.
- **Panel-to-vehicle link.** A small, curated API over a peer-to-peer message bus that works on the vehicle's own network and over a private VPN overlay, with automatic discovery of vehicles. Only resources declared in configuration are exposed, and the gateway refuses to start if that configuration does not match the robot. Video and bulk sensor data travel on their own path so they never crowd out commands.
- **Safety semantics.** Every command has a fixed lifecycle and an expiry, so a stale drive command stops the vehicle instead of being obeyed. Permissions are deny-by-default and enforced on the vehicle, not in the panel. Driving and turret are separate leased seats, so two operators can never fight over an actuator. The remote stop latches instantly on the panel but can never clear a physical stop.
- **Developing without the robot.** A mock platform speaks the exact same contract as the real vehicle, so the panel is built and tested on a desk and then runs against real hardware and the simulator without code changes. On the vehicle side, ROS 2 integration in C++.

Result: an operator on a laptop, off-site on a cellular connection, finds the vehicle with no manual setup, takes control, drives, aims the turret, watches two live camera feeds and stops it, with no server in between. Demonstrated on the real vehicle.

The team also brought my B.Sc. thesis, the synthetic test environment in NVIDIA Isaac Sim, into the project's development workflow.

[Lone Wolf at KONGSBERG](https://www.kongsberg.com/careers/summer-interns/lone-wolf/)
