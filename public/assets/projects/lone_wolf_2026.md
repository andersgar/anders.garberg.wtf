# Lone Wolf 2026: operator panel and vehicle link (KONGSBERG)

Summer internship at Kongsberg Defence & Aerospace, Land Systems, seven working weeks from June to August 2026, in a team of eight students. Lone Wolf is KONGSBERG's recurring summer project: an unmanned ground vehicle built on the Husarion Panther, which each year's team takes a step further toward autonomous navigation, drone tracking and remote operation from a command station. The 2026 team worked on sensor integration, the control system for self-driving and object tracking, and remote operation.

## My part

Two of us were on the ICS team, which means the operator panel and everything between it and the vehicle. We shared the panel, and I had the main responsibility for the backend on both sides of the link: the gateway on the vehicle and the panel's own backend. I also took part in the UI design and did some of the frontend work.

The hardest problem of the summer was the network architecture, and how the parts should talk to each other. I drew that up together with the team.

## The operator panel

A C++/Qt 6 application with native video rendering, chosen over a web stack to keep latency down when driving. It has pages for driving, turret control, map, system health and an overview of several vehicles. Joystick, gamepad and keyboard all work, the panel picks whichever is plugged in, and a dead-man switch stops the platform the moment you let go.

## The link between panel and vehicle

On the vehicle, a ROS 2 node in C++ exposes a narrow API over ZeroMQ: it translates the ROS 2 topics the panel needs into messages on the bus, and commands the other way. Only resources declared in configuration are exposed, and the gateway refuses to start if that configuration does not match the robot.

The link works on the vehicle's own network and over a Tailscale overlay, and the panel discovers vehicles by itself, so there is no manual setup and no server in between. Video goes on its own path as H.264 through GStreamer, and bulk sensor data likewise, so they never crowd out commands. The camera and the laser rangefinder talk to the panel directly; GNSS, IMU and lidar are processed on board first.

## Safety semantics

Every command has a lifecycle and an expiry, so a stale drive command stops the vehicle instead of being obeyed. Permissions are closed by default and enforced on the vehicle, not in the panel. Driving and turret are separate seats, so two operators cannot fight over the same actuator. The remote stop latches instantly on the panel, but it can never clear a physical stop.

## Developing without the robot

To build the panel without the vehicle, I wrote a mock backend that produces the same data over the same API as the real platform. The panel was developed and tested on a desk, and then ran against real hardware without code changes. On the vehicle's NVIDIA Jetson I wrote the ROS 2 launch files that start the nodes, the gateway and the video stream. The team worked in GitLab with code review and CI.

## Result

An operator on a laptop on 5G, away from the site, finds the vehicle with no setup, takes control, drives, aims the turret, watches two live camera feeds and stops it. We demonstrated this on the real vehicle for management at the end of the summer.

The team also took my bachelor's thesis, the test environment in NVIDIA Isaac Sim, into the project's workflow.

[Lone Wolf at KONGSBERG](https://www.kongsberg.com/careers/summer-interns/lone-wolf/)
