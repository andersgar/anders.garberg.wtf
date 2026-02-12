# BSc Thesis — Lone Wolf simulation and synthetic test environment (Spring 2026)

This bachelor thesis focuses on making the Lone Wolf autonomy stack easier to develop, verify, and regression test without constant access to the physical platform. The core idea is to build a ROS 2–consistent synthetic test environment in NVIDIA Isaac Sim for the Husarion Panther, so new contributors and future project cycles can reproduce scenarios and validate changes reliably.

The work targets repeatable scenario execution with consistent interfaces (time, TF, topics/services), and a modular approach to assets and payloads so sensors and configurations can be swapped without breaking the workflow. By shifting more testing into a controlled simulation environment, the project aims to reduce the cost and friction of field trials, while improving traceability and confidence in changes.

Expected outcomes include a documented simulation setup, a set of representative test scenarios, and a foundation for systematic verification (integration testing and regression checks) that supports long-term knowledge transfer across project years.
