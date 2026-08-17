# Cloud Architecture — Zero to Senior/Staff Software Engineer

> A practical, end-to-end handbook for mastering cloud architecture from first principles to Senior/Staff level.
>
> The goal is not to memorize AWS, Azure, or Google Cloud product names. The goal is to understand the architectural problems those services solve, their failure modes, security boundaries, cost models, and how to make sound design decisions at production scale.

---

# Table of Contents

1. [How to Use This Handbook](#1-how-to-use-this-handbook)
2. [What Cloud Architecture Is](#2-what-cloud-architecture-is)
3. [Cloud Architecture Mental Models](#3-cloud-architecture-mental-models)
4. [Traditional Infrastructure vs Cloud](#4-traditional-infrastructure-vs-cloud)
5. [Cloud Service Models](#5-cloud-service-models)
6. [Deployment Models](#6-deployment-models)
7. [Shared Responsibility Model](#7-shared-responsibility-model)
8. [Regions, Availability Zones, and Fault Domains](#8-regions-availability-zones-and-fault-domains)
9. [Global Cloud Infrastructure](#9-global-cloud-infrastructure)
10. [Accounts, Subscriptions, Projects, and Organizations](#10-accounts-subscriptions-projects-and-organizations)
11. [Resource Hierarchies and Blast Radius](#11-resource-hierarchies-and-blast-radius)
12. [Cloud Identity Fundamentals](#12-cloud-identity-fundamentals)
13. [IAM Deep Dive](#13-iam-deep-dive)
14. [Federation and SSO](#14-federation-and-sso)
15. [Workload Identity](#15-workload-identity)
16. [Least Privilege and Permission Boundaries](#16-least-privilege-and-permission-boundaries)
17. [Cloud Networking Fundamentals](#17-cloud-networking-fundamentals)
18. [VPCs and Virtual Networks](#18-vpcs-and-virtual-networks)
19. [Subnets](#19-subnets)
20. [CIDR and IP Address Planning](#20-cidr-and-ip-address-planning)
21. [Routing](#21-routing)
22. [Public and Private Networking](#22-public-and-private-networking)
23. [Internet Gateways and Egress](#23-internet-gateways-and-egress)
24. [NAT](#24-nat)
25. [Security Groups, Firewalls, and ACLs](#25-security-groups-firewalls-and-acls)
26. [Private Endpoints](#26-private-endpoints)
27. [DNS](#27-dns)
28. [Load Balancing](#28-load-balancing)
29. [Global Traffic Management](#29-global-traffic-management)
30. [CDNs and Edge](#30-cdns-and-edge)
31. [WAF and DDoS Protection](#31-waf-and-ddos-protection)
32. [Hybrid Connectivity](#32-hybrid-connectivity)
33. [VPNs and Dedicated Connectivity](#33-vpns-and-dedicated-connectivity)
34. [Hub-Spoke and Transit Networks](#34-hub-spoke-and-transit-networks)
35. [Peering](#35-peering)
36. [Zero Trust Networking](#36-zero-trust-networking)
37. [Cloud Compute Fundamentals](#37-cloud-compute-fundamentals)
38. [Virtual Machines](#38-virtual-machines)
39. [VM Images and Bootstrapping](#39-vm-images-and-bootstrapping)
40. [Autoscaling](#40-autoscaling)
41. [Containers](#41-containers)
42. [Managed Container Platforms](#42-managed-container-platforms)
43. [Kubernetes](#43-kubernetes)
44. [Serverless Functions](#44-serverless-functions)
45. [Managed Application Platforms](#45-managed-application-platforms)
46. [Batch and HPC](#46-batch-and-hpc)
47. [GPU and Accelerator Workloads](#47-gpu-and-accelerator-workloads)
48. [Choosing Compute](#48-choosing-compute)
49. [Object Storage](#49-object-storage)
50. [Block Storage](#50-block-storage)
51. [File Storage](#51-file-storage)
52. [Storage Performance](#52-storage-performance)
53. [Storage Lifecycle and Archival](#53-storage-lifecycle-and-archival)
54. [Data Durability](#54-data-durability)
55. [Backup Architecture](#55-backup-architecture)
56. [Database Services](#56-database-services)
57. [Relational Databases](#57-relational-databases)
58. [NoSQL Databases](#58-nosql-databases)
59. [Globally Distributed Databases](#59-globally-distributed-databases)
60. [Caching Services](#60-caching-services)
61. [Data Warehouses](#61-data-warehouses)
62. [Data Lakes](#62-data-lakes)
63. [Lakehouse Architecture](#63-lakehouse-architecture)
64. [Streaming Platforms](#64-streaming-platforms)
65. [Queues and Pub/Sub](#65-queues-and-pubsub)
66. [Event-Driven Cloud Architecture](#66-event-driven-cloud-architecture)
67. [Workflow Orchestration](#67-workflow-orchestration)
68. [API Gateways](#68-api-gateways)
69. [Service Discovery](#69-service-discovery)
70. [Service Mesh](#70-service-mesh)
71. [Microservices in the Cloud](#71-microservices-in-the-cloud)
72. [Modular Monoliths in the Cloud](#72-modular-monoliths-in-the-cloud)
73. [Cloud-Native Application Principles](#73-cloud-native-application-principles)
74. [Configuration Management](#74-configuration-management)
75. [Secrets Management](#75-secrets-management)
76. [Key Management and Encryption](#76-key-management-and-encryption)
77. [Certificates and PKI](#77-certificates-and-pki)
78. [Cloud Security Architecture](#78-cloud-security-architecture)
79. [Landing Zones](#79-landing-zones)
80. [Guardrails and Policy as Code](#80-guardrails-and-policy-as-code)
81. [Data Security and Classification](#81-data-security-and-classification)
82. [Threat Detection](#82-threat-detection)
83. [Audit and Security Logging](#83-audit-and-security-logging)
84. [Compliance Architecture](#84-compliance-architecture)
85. [Infrastructure as Code](#85-infrastructure-as-code)
86. [Terraform Concepts](#86-terraform-concepts)
87. [Cloud-Native IaC](#87-cloud-native-iac)
88. [State, Locking, and Drift](#88-state-locking-and-drift)
89. [GitOps](#89-gitops)
90. [CI/CD for Cloud Infrastructure](#90-cicd-for-cloud-infrastructure)
91. [Deployment Strategies](#91-deployment-strategies)
92. [Immutable Infrastructure](#92-immutable-infrastructure)
93. [Observability](#93-observability)
94. [Logging](#94-logging)
95. [Metrics](#95-metrics)
96. [Tracing](#96-tracing)
97. [Cloud Monitoring Design](#97-cloud-monitoring-design)
98. [SLIs, SLOs, SLAs, and Error Budgets](#98-slis-slos-slas-and-error-budgets)
99. [Reliability Engineering](#99-reliability-engineering)
100. [High Availability](#100-high-availability)
101. [Disaster Recovery](#101-disaster-recovery)
102. [RPO and RTO](#102-rpo-and-rto)
103. [Multi-AZ Architecture](#103-multi-az-architecture)
104. [Multi-Region Architecture](#104-multi-region-architecture)
105. [Active-Passive and Active-Active](#105-active-passive-and-active-active)
106. [Failover and Failback](#106-failover-and-failback)
107. [Resilience Patterns](#107-resilience-patterns)
108. [Chaos Engineering](#108-chaos-engineering)
109. [Capacity Planning](#109-capacity-planning)
110. [Performance Architecture](#110-performance-architecture)
111. [Cloud Quotas and Limits](#111-cloud-quotas-and-limits)
112. [Cloud Cost Architecture](#112-cloud-cost-architecture)
113. [FinOps](#113-finops)
114. [Tagging and Cost Allocation](#114-tagging-and-cost-allocation)
115. [Multi-Tenancy](#115-multi-tenancy)
116. [SaaS Cloud Architecture](#116-saas-cloud-architecture)
117. [Hybrid Cloud](#117-hybrid-cloud)
118. [Multi-Cloud](#118-multi-cloud)
119. [Cloud Migration](#119-cloud-migration)
120. [Migration Strategies](#120-migration-strategies)
121. [Database Migration](#121-database-migration)
122. [Application Modernization](#122-application-modernization)
123. [Cloud Operating Model](#123-cloud-operating-model)
124. [Platform Engineering](#124-platform-engineering)
125. [Internal Developer Platforms](#125-internal-developer-platforms)
126. [Cloud Governance](#126-cloud-governance)
127. [Enterprise Cloud Architecture](#127-enterprise-cloud-architecture)
128. [Provider Service Mapping](#128-provider-service-mapping)
129. [Provider-Agnostic Architecture](#129-provider-agnostic-architecture)
130. [Cloud Anti-Patterns](#130-cloud-anti-patterns)
131. [Cloud Failure Modes](#131-cloud-failure-modes)
132. [Cloud System Design Interview Framework](#132-cloud-system-design-interview-framework)
133. [Senior-Level Expectations](#133-senior-level-expectations)
134. [Staff-Level Expectations](#134-staff-level-expectations)
135. [Cloud Architecture Exercises](#135-cloud-architecture-exercises)
136. [Mastery Checklist](#136-mastery-checklist)
137. [Suggested Learning Path](#137-suggested-learning-path)

---

# 1. How to Use This Handbook

Do not start by memorizing hundreds of provider services.

First master the architectural categories:

```text
identity
networking
compute
storage
data
messaging
security
deployment
observability
reliability
governance
cost
```

Then learn how AWS, Azure, and Google Cloud implement those categories.

A strong cloud engineer should be able to answer:

- Which failure domain contains this resource?
- Is this service global, regional, zonal, or instance-local?
- What happens if one Availability Zone disappears?
- What happens if the entire region becomes unreachable?
- Where is user data physically stored?
- Which components can communicate privately?
- Which component owns egress to the internet?
- Which IAM principal performs this action?
- Can this workload run without long-lived credentials?
- What happens when DNS becomes stale?
- What happens if an API quota is exhausted?
- How are secrets rotated?
- How are backups restored?
- What is the actual recovery time?
- What is the per-request or per-tenant cost?
- Which parts are provider-specific?
- What is difficult to reverse?
- Who operates this system at 3 AM?
- How can hundreds of engineers use the platform safely?

Cloud mastery is primarily about **trade-offs, failure domains, security boundaries, and operational design**.

---

# 2. What Cloud Architecture Is

Cloud architecture is the design of applications, infrastructure, networks, identity, data, security, reliability, and operations using programmable infrastructure platforms.

A simplified production system:

```text
Users
  |
  v
DNS
  |
  v
CDN / DDoS / WAF
  |
  v
Global or Regional Load Balancer
  |
  v
API Gateway / Ingress
  |
  +--------------------------+
  |                          |
  v                          v
Application Compute      Static/Object Storage
  |
  +------------+--------------+----------------+
  |            |              |                |
  v            v              v                v
Cache       Database        Queue/Stream     External APIs
                               |
                               v
                            Workers
```

Cloud architecture includes much more than deployment:

- account design
- network topology
- identity
- trust boundaries
- deployment automation
- region strategy
- backup
- recovery
- observability
- capacity
- cost
- governance
- platform engineering

---

# 3. Cloud Architecture Mental Models

## Everything can fail

Assume:

- instance disappears
- container restarts
- disk becomes unavailable
- AZ fails
- region fails
- provider API is throttled
- DNS is stale
- certificates expire
- route changes break connectivity
- IAM policy blocks production
- someone deletes a resource
- dependency becomes slow
- queue backlog grows
- cloud control plane is degraded

Good architecture does not eliminate failure. It **contains and recovers from failure**.

## Everything is an API

Cloud resources are programmable:

```text
network
DNS
load balancer
storage
compute
database
IAM
certificate
firewall
queue
```

This makes Infrastructure as Code possible.

## Scope matters

Every resource has scope.

Examples:

```text
global
organization
account/project
region
zone
VPC
subnet
cluster
instance
```

Scope determines:

- blast radius
- availability
- security
- naming
- cost

## Managed does not mean responsibility-free

A managed database may remove:

- OS patching
- binary installation
- some backups
- failover implementation

You still own:

- schema
- queries
- indexes
- access control
- data lifecycle
- application retries
- recovery expectations
- cost

---

# 4. Traditional Infrastructure vs Cloud

Traditional infrastructure often involves:

```text
forecast demand
-> buy hardware
-> rack servers
-> install OS
-> configure network
-> deploy software
```

Cloud changes this to:

```text
declare resource
-> API creates resource
-> automate configuration
-> scale programmatically
```

Advantages:

- speed
- elasticity
- managed services
- global infrastructure
- automation

Risks:

- cost sprawl
- privilege sprawl
- configuration mistakes
- provider coupling
- hidden service quotas
- distributed-system complexity

The cloud removes some physical infrastructure burden but adds software-defined infrastructure complexity.

---

# 5. Cloud Service Models

## IaaS

Provider manages physical infrastructure.

You commonly manage:

- OS
- runtime
- application
- data
- patching
- host-level configuration

## PaaS

Provider manages more of:

- OS
- runtime
- platform
- scaling

You manage:

- code
- data
- configuration
- permissions

## SaaS

You consume an application.

Provider manages most application infrastructure.

## FaaS

Functions execute on demand.

You provide:

- code
- configuration
- IAM permissions

## CaaS

Managed container platforms abstract some infrastructure while preserving container packaging.

The more abstraction you consume, the less low-level control you typically have.

---

# 6. Deployment Models

## Public Cloud

Infrastructure operated by a cloud provider.

## Private Cloud

Cloud-style infrastructure dedicated to one organization.

## Hybrid Cloud

On-prem/private infrastructure plus public cloud.

## Multi-Cloud

Use of more than one major cloud provider.

Never choose hybrid or multi-cloud simply because it sounds architecturally mature.

Each additional environment increases:

- networking complexity
- identity complexity
- monitoring complexity
- operating skill requirements
- data movement complexity
- cost

---

# 7. Shared Responsibility Model

The exact boundary varies by service.

For a VM:

```text
Provider:
  physical facility
  hardware
  hypervisor

Customer:
  OS
  patches
  runtime
  application
  firewall rules
  IAM
  data
```

For a serverless function, the provider owns more runtime infrastructure.

But customer still owns:

- application code
- dependencies
- IAM
- secrets
- data
- business logic

Misconfiguration remains one of the biggest cloud risks.

---

# 8. Regions, Availability Zones, and Fault Domains

A region is a geographic cloud location.

An Availability Zone is an independent infrastructure location inside a region.

Example:

```text
Region
  |
  +-- AZ A
  +-- AZ B
  +-- AZ C
```

Multi-AZ architecture protects against many zonal failures.

It does **not** protect against all regional failures.

Fault-domain hierarchy can include:

```text
process
host
rack
zone
region
account
provider
```

Ask:

> Which failures are we required to survive?

Do not pay for multi-region active-active if the business only requires zonal high availability.

---

# 9. Global Cloud Infrastructure

Providers operate:

- regions
- zones
- edge locations
- private backbone
- global DNS
- global traffic systems

Understand whether a service's:

- control plane
- data plane
- metadata
- storage

are regional or global.

A globally managed control plane can become a very large blast-radius dependency.

---

# 10. Accounts, Subscriptions, Projects, and Organizations

Administrative containers vary by provider.

A mature hierarchy may look like:

```text
Organization
  |
  +-- Security
  +-- Shared Networking
  +-- Shared Services
  +-- Production
  |     +-- Product A
  |     +-- Product B
  |
  +-- NonProduction
        +-- Dev
        +-- Test
```

Separate boundaries provide:

- IAM isolation
- billing
- policy
- quota isolation
- incident containment

One giant cloud account is usually a long-term governance problem.

---

# 11. Resource Hierarchies and Blast Radius

Think about:

```text
If this credential is compromised, what can it affect?
If this policy is wrong, how much breaks?
If this quota is exhausted, which workloads stop?
```

Use organizational structure to limit blast radius.

Examples:

- production separate from development
- security logging in separate account
- backup vault protected separately
- network hub separate from application accounts

Centralization gives efficiency but increases blast radius.

---

# 12. Cloud Identity Fundamentals

Cloud identities include:

- human users
- administrators
- applications
- VMs
- containers
- serverless functions
- CI/CD pipelines
- external systems

Prefer temporary credentials.

For humans:

```text
Corporate Identity Provider
 -> SSO/Federation
 -> Cloud Role
 -> Temporary Session
```

Avoid creating long-lived local cloud users unless necessary.

---

# 13. IAM Deep Dive

IAM answers:

```text
Who
can do What
to Which Resource
under Which Conditions?
```

Conceptual policy:

```text
Principal: OrderService
Action: ReadSecret
Resource: PaymentProviderSecret
Condition: environment=production
```

Core principles:

- least privilege
- explicit ownership
- short-lived credentials
- separation of duties
- deny by default
- auditable changes

Avoid wildcard permissions without a strong reason.

---

# 14. Federation and SSO

Enterprise access should normally integrate with existing identity provider.

Benefits:

- centralized lifecycle
- MFA
- group management
- rapid offboarding
- reduced local users

Cloud role assignment can map identity-provider groups to permissions.

Do not create shared administrator credentials.

---

# 15. Workload Identity

Applications should authenticate through platform-issued identity.

Example:

```text
Kubernetes Service Account
 -> Federated Workload Identity
 -> Cloud IAM Role
 -> Object Storage
```

instead of:

```text
Cloud Access Key in environment variable
```

Benefits:

- temporary tokens
- automatic rotation
- no embedded secrets
- auditability
- fine-grained permissions

---

# 16. Least Privilege and Permission Boundaries

A payment worker that only reads one secret and writes one queue should not receive broad administrator permissions.

Use:

- resource-specific policies
- scoped actions
- conditions
- permission boundaries
- organization policies
- separate roles

Permissions tend to grow over time unless reviewed.

Perform access reviews.

---

# 17. Cloud Networking Fundamentals

You must understand:

- IPv4/IPv6
- CIDR
- subnet
- route
- gateway
- NAT
- firewall
- DNS
- load balancer
- VPN
- peering
- private endpoint

Cloud networking is software-defined, but packet behavior still follows networking fundamentals.

---

# 18. VPCs and Virtual Networks

A VPC/VNet is an isolated virtual network.

Example:

```text
10.0.0.0/16

Public:
10.0.1.0/24
10.0.2.0/24

Application:
10.0.10.0/24
10.0.11.0/24

Database:
10.0.20.0/24
10.0.21.0/24
```

Plan address ranges before creating hundreds of networks.

Overlapping CIDRs complicate:

- peering
- VPN
- acquisitions
- hybrid networking
- service meshes

---

# 19. Subnets

A subnet is a portion of the VPC address range.

A common pattern:

```text
AZ A
  public
  app
  data

AZ B
  public
  app
  data
```

"Public" and "private" are routing properties, not just names.

A resource in a public subnet is not automatically publicly reachable unless additional conditions exist.

---

# 20. CIDR and IP Address Planning

Example:

```text
10.0.0.0/16
```

contains 65,536 IPv4 addresses conceptually.

Plan for:

- application nodes
- pod IPs
- private endpoints
- future environments
- hybrid connectivity
- regional expansion

Kubernetes and large container platforms can consume many addresses.

Use IP address management at organizational scale.

---

# 21. Routing

Route table example:

```text
10.0.0.0/16 -> local
10.50.0.0/16 -> transit hub
0.0.0.0/0 -> internet/NAT path
```

When connectivity fails, troubleshoot:

1. DNS
2. source route
3. firewall
4. destination route
5. return route
6. service listener
7. TLS
8. application authorization

"Ping fails" does not fully diagnose cloud connectivity.

---

# 22. Public and Private Networking

Typical architecture:

```text
Internet
  |
  v
Public Load Balancer
  |
  v
Private Application
  |
  v
Private Database
```

Keep data stores private whenever feasible.

Public exposure should be deliberate.

---

# 23. Internet Gateways and Egress

Inbound and outbound internet connectivity are different problems.

Applications may need internet egress for:

- third-party APIs
- package downloads
- SaaS dependencies

Control egress where security requires:

- NAT
- egress proxy
- firewall
- allowlists
- private endpoints

Unrestricted outbound traffic increases data-exfiltration risk.

---

# 24. NAT

NAT enables private instances to initiate external connections.

Potential issues:

- cost
- throughput
- port exhaustion
- central dependency
- cross-zone data transfer

At scale, NAT design matters.

Use private provider endpoints for internal cloud services when appropriate.

---

# 25. Security Groups, Firewalls, and ACLs

Model explicit communication:

```text
Internet -> LB : 443
LB -> App : 8080
App -> DB : 5432
```

Avoid:

```text
0.0.0.0/0 -> Database : Any
```

Understand whether the control is:

- stateful
- stateless
- instance-level
- subnet-level
- network-level

Network policy is defense in depth, not application authorization.

---

# 26. Private Endpoints

Private endpoints let workloads reach managed services without traversing public internet paths.

Benefits:

- reduced exposure
- controlled routing
- egress-cost reduction in some designs

Challenges:

- DNS
- endpoint quotas
- routing
- per-service behavior

Private networking does not remove the need for IAM.

---

# 27. DNS

Cloud DNS can be:

- public
- private
- split-horizon
- service discovery

Important concepts:

- TTL
- caching
- failover records
- health checks
- resolver rules

DNS changes are not instantaneous.

Long-lived connections can continue to old endpoints after DNS changes.

---

# 28. Load Balancing

Layer 4 load balancing operates around TCP/UDP.

Layer 7 understands HTTP.

Capabilities may include:

- TLS termination
- host routing
- path routing
- health checks
- sticky sessions
- weighted routing

Health checks must be cheap and meaningful.

A load balancer can be highly available while the application behind it is not.

---

# 29. Global Traffic Management

Global routing may use:

- DNS
- anycast/global LB
- latency routing
- geography
- health routing
- weighted routing

Example:

```text
Users
 -> Global Traffic Layer
      -> Region A
      -> Region B
```

Traffic routing must align with data strategy.

Nearest-region routing may be pointless if every write goes back to one distant primary.

---

# 30. CDNs and Edge

CDN caches content near users.

Good candidates:

- JS/CSS
- images
- video
- downloads
- public API responses

Security considerations:

- signed URLs
- cache-key correctness
- authorization
- purge/invalidation

Caching one user's private response and serving it to another is a severe architecture bug.

---

# 31. WAF and DDoS Protection

Layers:

```text
DDoS protection
 -> CDN/Edge
 -> WAF
 -> Rate limiter
 -> Application security
```

WAF can detect/block common malicious patterns.

It cannot fix broken application authorization.

DDoS defense needs:

- network-layer absorption
- edge capacity
- application rate limiting
- scaling protections

---

# 32. Hybrid Connectivity

Hybrid systems connect cloud and data center.

Challenges:

- latency
- bandwidth
- routing
- DNS
- overlapping IP ranges
- asymmetric routing
- firewall policy
- outage behavior

Treat the connection as a WAN dependency.

Avoid making every cloud request synchronously depend on on-premises systems forever.

---

# 33. VPNs and Dedicated Connectivity

VPN:

- encrypted tunnel over internet
- fast provisioning
- variable latency

Dedicated connection:

- predictable bandwidth
- more control
- higher lead time/cost

Critical hybrid connectivity often needs redundant paths.

Test failover.

---

# 34. Hub-Spoke and Transit Networks

At enterprise scale:

```text
             Transit Hub
        /       |       \
     VPC A    VPC B    VPC C
        \       |       /
       On-prem / Shared Services
```

Hub may centralize:

- routing
- firewall
- DNS
- egress
- on-prem connectivity

But centralized hubs create high blast radius.

---

# 35. Peering

Peering directly connects networks.

At small scale it is simple.

At large scale, full mesh becomes:

```text
O(n²)
```

operational relationships.

Transit architectures simplify connectivity.

Be aware of transitive-routing limitations depending on platform.

---

# 36. Zero Trust Networking

Zero trust says:

> Being on an internal network does not automatically make a workload trusted.

Use:

- workload identity
- mTLS
- explicit authorization
- least privilege
- audit
- network segmentation

A compromised internal service should not automatically reach every datastore.

---

# 37. Cloud Compute Fundamentals

Main compute models:

- VM
- container
- Kubernetes
- serverless
- managed app platform
- batch
- GPU

Choose based on:

- workload duration
- traffic shape
- operating-system needs
- startup
- portability
- scaling
- cost
- operational burden

---

# 38. Virtual Machines

VMs offer maximum general-purpose control.

Use cases:

- legacy applications
- specialized OS/software
- workloads needing host control

Operational needs:

- patching
- image management
- autoscaling
- security agents
- monitoring
- shutdown behavior

Prefer replacement over manual mutation.

---

# 39. VM Images and Bootstrapping

Golden images may include:

- OS patches
- runtime
- security agents
- base configuration

Bootstrapping adds environment-specific information.

Avoid:

- baking secrets into image
- running unpinned install scripts from internet at every boot

Images should be:

- reproducible
- versioned
- scanned
- immutable

---

# 40. Autoscaling

Autoscaling signals:

- CPU
- memory
- RPS
- queue depth
- custom metrics
- schedule

Scaling is not instant.

Total delay:

```text
metric delay
+ scaling decision
+ instance scheduling
+ startup
+ readiness
```

Keep capacity headroom for spikes.

Do not autoscale application to a level that overwhelms database.

---

# 41. Containers

Containers package:

- application
- runtime dependencies
- filesystem layer

They share host kernel.

Benefits:

- reproducibility
- portability
- density
- fast deployment

Cloud concerns:

- registry
- image scanning
- runtime security
- network
- persistent storage
- identity

---

# 42. Managed Container Platforms

Managed container platforms reduce control-plane complexity.

You still own:

- application
- image
- IAM
- networking
- scaling configuration
- observability

They can be simpler than Kubernetes for many teams.

---

# 43. Kubernetes

Managed Kubernetes still requires understanding:

- Pods
- Deployments
- Services
- Ingress/Gateway
- StatefulSets
- Jobs
- ConfigMaps
- Secrets
- Persistent Volumes
- autoscaling
- scheduling

Cloud-specific integrations include:

- load balancers
- IAM
- storage drivers
- pod networking
- node pools

Kubernetes is an orchestration platform, not a cloud strategy by itself.

---

# 44. Serverless Functions

Best for:

- event handlers
- bursty APIs
- automation
- scheduled work

Benefits:

- no server fleet management
- rapid scale
- usage-driven billing

Challenges:

- cold start
- execution timeout
- concurrency quota
- database connections
- local filesystem assumptions
- debugging

A function that calls ten other services is still part of a distributed system.

---

# 45. Managed Application Platforms

PaaS can provide:

- runtime
- deployment
- autoscaling
- health management

Good when teams prioritize product development over platform control.

Trade-offs:

- less infrastructure control
- provider-specific behavior
- runtime constraints

---

# 46. Batch and HPC

Batch workloads include:

- data processing
- exports
- simulations
- media transforms

Requirements:

- queues
- job scheduling
- checkpointing
- retries
- large compute pools

HPC may require:

- fast interconnect
- placement control
- specialized storage

Not all workloads fit request/response architecture.

---

# 47. GPU and Accelerator Workloads

Use GPUs/accelerators for:

- ML inference/training
- graphics
- specialized compute

Cloud considerations:

- scarce capacity
- quota
- cost
- warm-up
- model-loading time
- utilization

GPU idle time can be extremely expensive.

Batch and dynamic scheduling matter.

---

# 48. Choosing Compute

Decision framework:

```text
Need host/OS control?
  -> VM

Containerized service, moderate orchestration?
  -> managed container platform

Complex multi-service orchestration?
  -> Kubernetes

Short burst/event handler?
  -> serverless

Large queued compute?
  -> batch platform

Accelerated workload?
  -> GPU/accelerator
```

Choose the simplest suitable platform.

---

# 49. Object Storage

Use for:

- user files
- logs
- backups
- static assets
- data lakes
- artifacts

Features:

- very high durability
- versioning
- lifecycle
- encryption
- replication

Application patterns:

```text
Client
 -> Backend obtains presigned URL
 -> Client uploads directly
 -> Event triggers processing
```

Do not treat object storage like a normal filesystem.

---

# 50. Block Storage

Block storage attaches to compute like a disk.

Important dimensions:

- IOPS
- throughput
- latency
- capacity
- attachment rules

Common for:

- VM filesystems
- databases
- stateful workloads

Snapshots help backup but still require application-consistency planning.

---

# 51. File Storage

Managed network filesystems provide shared filesystem semantics.

Use when applications require:

- shared POSIX-like filesystem
- shared content
- legacy compatibility

Trade-offs:

- throughput
- latency
- locking
- cost

For cloud-native file objects, object storage is often simpler.

---

# 52. Storage Performance

Storage bottlenecks can be:

- IOPS
- throughput
- latency
- queue depth

Small random database I/O and large sequential analytics I/O are very different workloads.

Provision based on actual access pattern.

---

# 53. Storage Lifecycle and Archival

Data should move through classes:

```text
hot
 -> warm
 -> cold
 -> archive
 -> delete
```

Consider:

- access frequency
- retrieval latency
- retrieval charge
- minimum retention
- compliance

Infinite retention is rarely free or necessary.

---

# 54. Data Durability

Durability answers:

> Once acknowledged, how likely is data to survive infrastructure failure?

Understand:

- local disk durability
- replication
- multi-AZ
- multi-region copy
- backup

High availability and durability are different properties.

---

# 55. Backup Architecture

A good backup design defines:

- what is backed up
- frequency
- retention
- encryption
- immutability
- geographic separation
- access controls
- restore procedure

Backups must be tested.

A backup that cannot be restored is not a backup strategy.

---

# 56. Database Services

Managed databases provide operational features but remain application dependencies.

Consider:

- engine
- size
- HA mode
- replicas
- backups
- maintenance
- encryption
- network isolation
- connection limits

The cloud does not fix poor schema/query design.

---

# 57. Relational Databases

Cloud relational architecture may include:

```text
Application
 -> DB Proxy
 -> Primary
      |
      +-> Read Replica A
      +-> Read Replica B
```

Use:

- Multi-AZ for HA
- replicas for read scaling
- backups for recovery

Be careful with:

- replication lag
- stale reads
- failover connection resets
- excessive application connection pools

---

# 58. NoSQL Databases

Managed NoSQL can provide:

- elastic partitioning
- key-value/document model
- global replication

Important:

- partition key
- hot key
- consistency
- indexes
- transaction boundaries
- billing model

A poor partition key can destroy scalability.

---

# 59. Globally Distributed Databases

Global databases may offer:

- multi-region replication
- regional reads/writes
- tunable consistency

Trade-offs:

```text
consistency
latency
availability
cost
```

Strong globally coordinated writes add latency.

Use global writes only when business semantics require them.

---

# 60. Caching Services

Cloud caches reduce:

- database load
- latency

Use for:

- cache
- sessions
- counters
- rate limits

Design for cache loss.

If every miss falls back to DB, total cache outage can overload DB.

---

# 61. Data Warehouses

Warehouses serve analytical workloads.

Characteristics:

- columnar processing
- large scans
- aggregation
- BI integration

Separate OLTP from analytics when workloads interfere.

Architecture:

```text
OLTP
 -> CDC/ETL
 -> Warehouse
```

Monitor data freshness.

---

# 62. Data Lakes

Data lakes usually use object storage for:

- raw events
- logs
- files
- structured/unstructured data

Need:

- catalog
- schema
- governance
- access controls
- lifecycle
- data quality

Without governance, a lake becomes a data swamp.

---

# 63. Lakehouse Architecture

Lakehouse attempts to combine:

- low-cost object storage
- data-lake flexibility
- warehouse-style table management

Important concepts:

- table format
- catalog
- transaction metadata
- compaction
- schema evolution

Evaluate whether complexity is needed.

---

# 64. Streaming Platforms

Managed streaming systems support:

- events
- telemetry
- CDC
- pipelines

Design:

- partition count
- partition key
- retention
- replication
- schema
- consumer groups

Managed infrastructure does not remove event-ordering and idempotency problems.

---

# 65. Queues and Pub/Sub

Queues:

```text
producer -> queue -> worker
```

Pub/Sub:

```text
producer -> topic -> many subscribers
```

Cloud features may include:

- DLQ
- delayed delivery
- FIFO
- visibility timeout
- filtering

Assume duplicates unless explicitly proven otherwise.

---

# 66. Event-Driven Cloud Architecture

Example:

```text
Object Uploaded
 -> Event Bus
 -> Queue
 -> Processing Worker
 -> Metadata DB
 -> Notification Event
```

Benefits:

- loose coupling
- buffering
- independent scaling

Challenges:

- hidden workflow
- duplicates
- replay
- ordering
- troubleshooting

Use durable operation state for important workflows.

---

# 67. Workflow Orchestration

Workflow engines are useful for:

- long-running processes
- retries
- timers
- branching
- compensation

Example:

```text
Create Order
 -> Reserve Inventory
 -> Charge Payment
 -> Schedule Shipment
```

Use orchestration when workflow complexity justifies platform dependency.

---

# 68. API Gateways

Cloud API gateway capabilities:

- authentication
- throttling
- routing
- quotas
- protocol transformation
- metrics

Use for shared policy.

Do not move complex domain logic into gateway.

---

# 69. Service Discovery

Services locate each other via:

- DNS
- registry
- platform-native names
- load balancers

Service instances are ephemeral.

Discovery must tolerate:

- churn
- health changes
- caching

---

# 70. Service Mesh

Service mesh may provide:

- mTLS
- traffic policies
- retries
- telemetry
- service identity

Costs:

- proxies
- complexity
- debugging
- hidden retry behavior

Use when organizational scale warrants it.

---

# 71. Microservices in the Cloud

Cloud simplifies deployment of many services, but microservices introduce:

- network failure
- versioning
- distributed data
- observability
- IAM
- deployment ownership

Microservices are not required for cloud-native architecture.

---

# 72. Modular Monoliths in the Cloud

A modular monolith can still use:

- autoscaling
- managed DB
- cache
- queue
- object storage
- CDN

Often it provides simpler operational model.

Start with strong internal boundaries.

Extract services when there is real benefit.

---

# 73. Cloud-Native Application Principles

Useful properties:

- stateless request-serving instances
- externalized durable state
- disposable instances
- health checks
- graceful shutdown
- dynamic configuration
- automation
- horizontal scaling

But not every process can be stateless.

Databases, brokers, and durable workers have stateful requirements.

---

# 74. Configuration Management

Configuration should be:

- validated
- environment-specific
- auditable
- versioned where appropriate

Examples:

- feature flags
- endpoints
- concurrency limits
- timeouts

Avoid undocumented console-only configuration.

---

# 75. Secrets Management

Store:

- passwords
- API keys
- signing keys
- certificates

in dedicated secret systems.

Applications should access secrets through workload identity.

Plan:

- rotation
- audit
- expiry
- revocation
- least privilege

---

# 76. Key Management and Encryption

KMS systems manage encryption keys.

Envelope encryption:

```text
Data
 -> encrypted with Data Key
Data Key
 -> encrypted with KMS Key
```

Benefits:

- central key policy
- audit
- rotation

Separate key-management permissions from data access when appropriate.

---

# 77. Certificates and PKI

Certificates are used for:

- HTTPS
- mTLS
- internal identity
- private PKI

Automate:

- issuance
- renewal
- rotation
- expiry monitoring

Certificate expiry is a common preventable outage.

---

# 78. Cloud Security Architecture

Security layers:

```text
Organization guardrails
 -> Account boundary
 -> IAM
 -> Network
 -> Workload identity
 -> Application authz
 -> Encryption
 -> Logging
 -> Detection
 -> Backup
```

No single layer is enough.

---

# 79. Landing Zones

A landing zone provides secure cloud foundation.

Typical components:

- organization structure
- account/project vending
- identity federation
- network topology
- logging
- security services
- policies
- billing
- shared services
- IaC

A good landing zone accelerates teams instead of blocking them.

---

# 80. Guardrails and Policy as Code

Automate rules:

- approved regions
- encryption required
- public storage denied
- mandatory tags
- logging enabled
- restricted IAM

Controls can be:

- preventive
- detective
- corrective

Prefer machine-enforced guardrails over policy PDFs.

---

# 81. Data Security and Classification

Classify data:

- public
- internal
- confidential
- restricted

Controls may differ for:

- encryption
- retention
- region
- logging
- support access

Map every copy:

```text
DB
cache
queue
logs
analytics
backup
object storage
third-party
```

---

# 82. Threat Detection

Cloud threat detection can use:

- control-plane logs
- identity signals
- network flow
- malware findings
- anomaly detection

Detection is only useful if:

- findings route to owners
- alerts have runbooks
- isolation/response exists

---

# 83. Audit and Security Logging

Centralize:

- cloud API audit
- login events
- IAM changes
- network flow logs
- admin actions

Store security logs in a protected account/project where attackers of one workload cannot easily delete them.

---

# 84. Compliance Architecture

Compliance requirements can affect:

- region
- encryption
- retention
- key custody
- access approval
- audit
- deletion
- backups

Architect for evidence generation.

Manual audit evidence does not scale.

---

# 85. Infrastructure as Code

IaC makes infrastructure:

- reviewable
- repeatable
- versioned
- testable

Workflow:

```text
change code
 -> validate
 -> plan
 -> review
 -> apply
 -> verify
```

Avoid manually creating production resources as normal process.

---

# 86. Terraform Concepts

Know:

- provider
- resource
- module
- data source
- state
- plan
- apply
- import

Good module:

- clear purpose
- sensible defaults
- limited interface

Bad module:

- giant abstraction for every possible service

---

# 87. Cloud-Native IaC

Provider-native IaC can offer:

- immediate feature support
- tight provider integration

Trade-off:

- provider coupling

Provider coupling is not automatically bad.

If a managed service provides major value, deliberate coupling may be rational.

---

# 88. State, Locking, and Drift

IaC state is critical.

Protect with:

- remote storage
- encryption
- locking
- restricted access
- backup

Drift occurs when deployed resources differ from code.

Detect and reconcile.

---

# 89. GitOps

GitOps model:

```text
desired state in Git
 -> controller detects change
 -> environment converges
```

Benefits:

- audit
- rollback
- consistency

Need emergency access procedures and protection against bad global changes.

---

# 90. CI/CD for Cloud Infrastructure

Infrastructure pipeline:

```text
format
-> lint
-> security scan
-> policy check
-> plan
-> review
-> apply
-> verify
```

Separate credentials per environment.

Production changes should be auditable.

---

# 91. Deployment Strategies

Cloud release techniques:

- rolling
- blue/green
- canary
- weighted routing
- feature flags
- shadow traffic

Validate:

- technical metrics
- business metrics
- dependency behavior

Deployment success is not just "resource exists."

---

# 92. Immutable Infrastructure

Instead of:

```text
SSH into server and patch
```

prefer:

```text
build new image
deploy replacement
remove old
```

This reduces drift.

Emergency manual changes should be captured back into automation.

---

# 93. Observability

Cloud observability spans:

- edge
- network
- platform
- application
- data
- business

Signals:

- logs
- metrics
- traces
- audit events
- profiles

Correlate by:

- service
- region
- zone
- version
- tenant
- request

---

# 94. Logging

Use structured logs.

Example:

```json
{
  "service": "orders",
  "region": "asia-south",
  "requestId": "r123",
  "level": "error",
  "message": "database timeout"
}
```

Avoid:

- secrets
- raw tokens
- giant payloads
- unlimited retention

Cloud logging can be expensive.

---

# 95. Metrics

Track:

- requests
- errors
- latency
- CPU
- memory
- queue backlog
- DB connections
- cache hit rate
- NAT throughput
- quota usage

Avoid high-cardinality metric labels.

---

# 96. Tracing

Distributed tracing shows:

```text
Edge
 -> Gateway
 -> Service A
 -> Service B
 -> Database
```

Use trace context across:

- HTTP
- gRPC
- events

Sampling controls cost.

---

# 97. Cloud Monitoring Design

Monitor by layer:

```text
Global routing
Edge
Load balancer
Compute
Application
Database
Messaging
External dependencies
Business outcome
```

A healthy VM does not prove users can checkout.

---

# 98. SLIs, SLOs, SLAs, and Error Budgets

SLI:

```text
checkout success ratio
```

SLO:

```text
99.95% over 30 days
```

SLA:

external contractual commitment.

Error budget:

allowed unreliability.

Use error budget to balance change velocity and reliability work.

---

# 99. Reliability Engineering

Reliability techniques:

- redundancy
- timeouts
- retries
- idempotency
- bulkheads
- queues
- backpressure
- load shedding
- graceful degradation

Cloud redundancy does not help if every instance depends on the same failing database or bad configuration.

---

# 100. High Availability

High availability = survive expected failures without unacceptable interruption.

Example:

```text
Regional Load Balancer
   |            |
   v            v
 App AZ A     App AZ B
      \        /
       HA Database
```

Also eliminate:

- single NAT
- single worker
- single secrets path
- single DNS dependency

---

# 101. Disaster Recovery

DR deals with larger events:

- region loss
- ransomware
- accidental deletion
- logical corruption
- account compromise

Strategies:

- backup/restore
- pilot light
- warm standby
- hot standby
- active-active

Choose based on RPO/RTO and cost.

---

# 102. RPO and RTO

RPO:

> Maximum acceptable data loss.

RTO:

> Maximum acceptable recovery time.

Example:

```text
RPO = 5 minutes
RTO = 30 minutes
```

These are business requirements.

Architecture must be designed to meet them.

---

# 103. Multi-AZ Architecture

Deploy across zones:

- app instances
- Kubernetes nodes
- load balancers
- databases
- caches where supported

If one AZ fails, remaining capacity must handle load.

Normal utilization should leave failure headroom.

---

# 104. Multi-Region Architecture

Reasons:

- DR
- latency
- residency
- business continuity

Challenges:

- replication
- consistency
- failover
- routing
- conflict resolution
- cost

Single-region multi-AZ is enough for many systems.

---

# 105. Active-Passive and Active-Active

## Active-Passive

One region serves traffic.

Secondary is standby.

Simpler data semantics.

## Active-Active

Multiple regions serve simultaneously.

Benefits:

- lower global latency
- capacity utilization

Costs:

- multi-writer complexity
- conflict handling
- global routing complexity

---

# 106. Failover and Failback

Failover:

1. detect
2. confirm
3. stop/fence old writes
4. promote secondary
5. redirect traffic
6. verify

Failback:

1. synchronize
2. validate
3. move traffic
4. restore roles
5. verify

Test both.

---

# 107. Resilience Patterns

For every remote dependency consider:

- deadline
- bounded retry
- jitter
- circuit breaker
- concurrency limit
- fallback
- observability

Retries without limits can cause cascading failure.

---

# 108. Chaos Engineering

Test assumptions:

- terminate instance
- block route
- remove permission
- fail DNS
- add latency
- stop one AZ
- stop broker
- fill disk

Run with:

- hypothesis
- scope
- rollback
- monitoring

---

# 109. Capacity Planning

Estimate:

```text
traffic
concurrency
storage
network
IOPS
DB connections
queue throughput
```

Plan for:

- peak
- growth
- failure
- maintenance

Autoscaling does not remove downstream limits.

---

# 110. Performance Architecture

Latency sources:

- geographic distance
- TLS
- edge
- gateway
- network hops
- compute
- DB
- cache
- cross-region calls

Measure:

- p50
- p95
- p99

Avoid cross-region synchronous chatty calls on critical path.

---

# 111. Cloud Quotas and Limits

Cloud has limits:

- API requests
- IP addresses
- instance counts
- function concurrency
- load balancers
- storage throughput
- database connections

Monitor quota headroom.

Request quota increases before major launches.

---

# 112. Cloud Cost Architecture

Major cost drivers:

- compute
- database
- storage
- network egress
- NAT
- logging
- managed services
- licenses
- idle resources

Cost is a first-class architectural dimension.

---

# 113. FinOps

FinOps connects:

- engineering
- finance
- product

Practices:

- allocation
- budget
- forecasting
- rightsizing
- commitment discounts
- anomaly detection
- unit economics

Track:

```text
cost per request
cost per tenant
cost per job
cost per GB
```

---

# 114. Tagging and Cost Allocation

Tags/labels:

```text
owner
team
service
environment
cost_center
data_classification
```

Use for:

- cost
- security
- ownership
- cleanup

Enforce tags automatically.

---

# 115. Multi-Tenancy

Isolation models:

```text
shared app + shared DB
shared app + DB/schema per tenant
dedicated stack per tenant
```

Trade-offs:

- cost
- isolation
- operational complexity
- compliance

Large tenants may migrate to dedicated cells.

---

# 116. SaaS Cloud Architecture

SaaS needs:

- tenant provisioning
- tenant routing
- quotas
- metering
- billing
- tenant-aware IAM
- tenant-aware observability
- data residency

A tenant is an operational dimension, not just a `tenant_id` column.

---

# 117. Hybrid Cloud

Hybrid is common during migration.

Challenges:

- latency
- connectivity
- DNS
- identity
- routing
- operations

Make the cross-environment dependency graph explicit.

Aim to reduce synchronous coupling over time.

---

# 118. Multi-Cloud

Valid reasons:

- regulation
- acquisition
- customer contracts
- provider-specific capabilities
- strategic risk

Costs:

- duplicate expertise
- networking
- IAM
- tooling
- DR
- observability

Avoid building lowest-common-denominator architecture unless portability is a real requirement.

---

# 119. Cloud Migration

Migration program needs:

- application inventory
- dependency map
- data classification
- business priority
- landing zone
- network
- migration waves
- testing
- rollback

Migrate applications, not just servers.

---

# 120. Migration Strategies

Common Rs:

- Rehost
- Replatform
- Refactor/Re-architect
- Repurchase
- Retire
- Retain
- Relocate

Choose per workload.

Do not refactor every system during initial cloud migration.

---

# 121. Database Migration

Pattern:

```text
initial copy
 -> continuous replication/CDC
 -> validation
 -> cutover
 -> verify
 -> decommission
```

Consider:

- downtime
- data volume
- schema differences
- sequences
- consistency
- rollback

Use reconciliation.

---

# 122. Application Modernization

Modernization may include:

- containerization
- managed DB
- event-driven workflows
- serverless
- modularization
- microservices

Modernize only where it creates business/operational value.

---

# 123. Cloud Operating Model

Define:

- who creates accounts/projects
- who owns networking
- who manages identity
- who owns security
- who pays
- who responds to incidents
- how teams deploy

Without operating model, cloud becomes ticket chaos or uncontrolled sprawl.

---

# 124. Platform Engineering

Platform teams provide reusable capabilities:

- service templates
- CI/CD
- Kubernetes
- databases
- DNS
- secrets
- observability
- identity

Goal:

> Make the secure, reliable path the easiest path.

---

# 125. Internal Developer Platforms

An IDP may support:

```text
Create service
Provision database
Request queue
Deploy
View logs
Request domain
```

A platform is a product.

Measure:

- adoption
- developer lead time
- deployment frequency
- reliability

---

# 126. Cloud Governance

Govern:

- account structure
- IAM
- regions
- networking
- tagging
- security
- cost
- approved services
- data residency

Good governance uses automated guardrails.

Bad governance becomes a manual approval queue.

---

# 127. Enterprise Cloud Architecture

Enterprise foundations often include:

- organization hierarchy
- landing zone
- identity federation
- central security
- central audit
- shared network
- developer platform
- cost management

Avoid global single points in shared runtime services.

Centralized control planes should degrade safely.

---

# 128. Provider Service Mapping

Conceptual mapping:

| Capability | AWS-style examples | Azure-style examples | Google Cloud-style examples |
|---|---|---|---|
| VM | EC2 | Virtual Machines | Compute Engine |
| Kubernetes | EKS | AKS | GKE |
| Serverless | Lambda | Functions | Cloud Functions / serverless runtimes |
| Object Storage | S3 | Blob Storage | Cloud Storage |
| Relational DB | RDS/Aurora | Azure SQL / managed PostgreSQL | Cloud SQL / AlloyDB-family services |
| NoSQL | DynamoDB | Cosmos DB | Firestore / Bigtable |
| Queue/PubSub | SQS/SNS/EventBridge | Service Bus/Event Grid | Pub/Sub |
| CDN | CloudFront | Front Door/CDN | Cloud CDN |
| DNS | Route 53 | Azure DNS | Cloud DNS |
| Secrets | Secrets Manager | Key Vault | Secret Manager |
| KMS | KMS | Key Vault / Managed HSM | Cloud KMS |
| Monitoring | CloudWatch | Azure Monitor | Cloud Monitoring |

Exact product features evolve. Use provider documentation when implementing a real system.

---

# 129. Provider-Agnostic Architecture

Provider-agnostic architecture means:

- business logic remains portable where practical
- infrastructure coupling is deliberate
- migration cost is understood

It does **not** mean avoiding every managed service.

A managed provider database may save years of operations.

The right question is:

> Is this coupling worth the value?

---

# 130. Cloud Anti-Patterns

## One giant account

Huge blast radius.

## Static credentials

Security risk.

## Public database

Unnecessary exposure.

## Manual production console changes

Drift.

## Kubernetes everywhere

Complexity without benefit.

## Multi-cloud by default

Operational burden.

## No cost ownership

Uncontrolled spend.

## No restore test

False backup confidence.

## No quota monitoring

Unexpected launch failures.

## Every region writes everything

Conflict complexity.

---

# 131. Cloud Failure Modes

Common incidents:

- IAM change blocks application
- DNS record wrong
- TLS certificate expired
- NAT ports exhausted
- autoscaling too slow
- one AZ overloaded
- quota exceeded
- queue backlog grows
- managed DB fails over
- application connection pool does not recover
- bad infrastructure deployment deletes resource
- storage bucket becomes public
- backup restore fails
- cross-region replication lag grows
- external provider becomes slow

Build runbooks.

---

# 132. Cloud System Design Interview Framework

## 1. Requirements

Ask:

- users?
- traffic?
- geography?
- availability?
- latency?
- RPO?
- RTO?
- compliance?
- budget?

## 2. Region Strategy

Choose:

- single region
- multi-AZ
- multi-region

## 3. Network

Draw:

```text
Internet
 -> Edge
 -> VPC
 -> Load Balancer
 -> Private Compute
 -> Private Data
```

## 4. Compute

Explain VM/container/Kubernetes/serverless choice.

## 5. Data

Choose:

- SQL
- NoSQL
- object storage
- cache

## 6. Security

- IAM
- secrets
- encryption
- firewall
- private endpoints

## 7. Reliability

- redundancy
- backup
- failover
- degradation

## 8. Observability

- logs
- metrics
- traces
- SLO

## 9. Cost

Estimate important drivers.

## 10. Trade-offs

Explain why this design is appropriate.

---

# 133. Senior-Level Expectations

Senior cloud engineers should be able to:

- design secure VPC/VNet
- troubleshoot routing
- design IAM
- create IaC
- deploy containers/Kubernetes
- choose managed data services
- create observability
- build HA
- design backup/restore
- estimate cloud cost
- lead cloud incidents
- migrate workloads

They understand underlying concepts, not only console clicks.

---

# 134. Staff-Level Expectations

Staff-level cloud work is organization-wide.

Responsibilities may include:

- landing zone architecture
- platform strategy
- multi-region strategy
- cloud governance
- identity architecture
- network standards
- cost governance
- migration programs
- resilience standards
- developer experience

Staff questions:

- What should be centralized?
- What should be decentralized?
- Where is blast radius too large?
- Which services should teams self-provision?
- Which provider lock-in is acceptable?
- How do we migrate safely?
- How do we measure platform success?
- How do we lower organizational cognitive load?

---

# 135. Cloud Architecture Exercises

## Beginner

1. Static website
2. REST API + managed DB
3. File upload system
4. Private VPC
5. Background worker

## Intermediate

6. Highly available web app
7. Containerized SaaS
8. Serverless image pipeline
9. Kubernetes application
10. Central logging system
11. Secure secret-management architecture
12. Hybrid connectivity
13. Data lake
14. Event-driven notifications
15. CI/CD platform

## Senior

16. Multi-account landing zone
17. Multi-tenant SaaS
18. Multi-AZ payments service
19. Regional streaming platform
20. Zero-trust service platform
21. Global CDN/API system
22. DR architecture
23. Cloud migration program
24. Enterprise Kubernetes platform
25. Organization-wide observability

## Staff

26. Multi-region SaaS platform
27. Global identity platform
28. Enterprise landing zone
29. Internal developer platform
30. Global data residency architecture
31. Multi-cloud governance
32. Cell-based architecture
33. Company-wide FinOps platform
34. Cloud reliability program
35. Enterprise modernization roadmap

---

# 136. Mastery Checklist

## Fundamentals

- [ ] cloud service models
- [ ] shared responsibility
- [ ] region vs AZ
- [ ] resource scope
- [ ] account/project hierarchy
- [ ] IAM
- [ ] federation
- [ ] workload identity

## Networking

- [ ] VPC/VNet
- [ ] CIDR
- [ ] subnet
- [ ] routing
- [ ] NAT
- [ ] firewall
- [ ] private endpoint
- [ ] DNS
- [ ] load balancing
- [ ] CDN
- [ ] VPN
- [ ] dedicated connectivity
- [ ] hub-spoke
- [ ] zero trust

## Compute

- [ ] VM
- [ ] autoscaling
- [ ] containers
- [ ] Kubernetes
- [ ] serverless
- [ ] batch
- [ ] GPU

## Storage

- [ ] object
- [ ] block
- [ ] file
- [ ] lifecycle
- [ ] durability
- [ ] backups

## Data

- [ ] SQL
- [ ] NoSQL
- [ ] cache
- [ ] warehouse
- [ ] lake
- [ ] streaming
- [ ] queues
- [ ] workflow orchestration

## Security

- [ ] KMS
- [ ] secrets
- [ ] PKI
- [ ] WAF
- [ ] DDoS
- [ ] threat detection
- [ ] audit
- [ ] policy as code
- [ ] compliance

## IaC / Delivery

- [ ] Terraform
- [ ] state
- [ ] drift
- [ ] GitOps
- [ ] CI/CD
- [ ] canary
- [ ] blue/green
- [ ] immutable infrastructure

## Reliability

- [ ] SLO
- [ ] multi-AZ
- [ ] multi-region
- [ ] RPO
- [ ] RTO
- [ ] failover
- [ ] failback
- [ ] backup restore tests
- [ ] chaos engineering

## Cost

- [ ] tagging
- [ ] allocation
- [ ] budgets
- [ ] rightsizing
- [ ] egress cost
- [ ] unit economics
- [ ] anomaly detection

## Senior

- [ ] architecture reviews
- [ ] production incidents
- [ ] secure network design
- [ ] migration planning
- [ ] cost/reliability trade-offs
- [ ] platform ownership

## Staff

- [ ] landing zones
- [ ] organization-wide standards
- [ ] platform strategy
- [ ] multi-region strategy
- [ ] cloud governance
- [ ] migration programs
- [ ] developer enablement
- [ ] cloud economics

---

# 137. Suggested Learning Path

## Phase 1 — Foundations

Learn:

- Linux
- networking
- DNS
- HTTP/TLS
- IAM
- VPC
- VMs
- object storage
- managed DB

Build:

```text
Internet
 -> Load Balancer
 -> Private Compute
 -> Managed Database
```

## Phase 2 — Production Cloud

Add:

- autoscaling
- queue
- cache
- secrets
- observability
- backup
- IaC
- CI/CD

## Phase 3 — Cloud Native

Learn:

- containers
- Kubernetes
- serverless
- event-driven architecture
- managed data services

## Phase 4 — Senior Architecture

Master:

- landing zones
- hybrid networking
- HA/DR
- multi-region
- security
- FinOps
- governance

## Phase 5 — Staff Architecture

Focus on:

- enterprise platform strategy
- organizational guardrails
- migration programs
- global reliability
- cost governance
- developer experience
- technical strategy

At Staff level, think:

```text
How should hundreds of engineers use cloud safely, reliably, and economically?
```

not only:

```text
How do I deploy this service?
```

---

# Appendix A — Cloud Resource Scope Cheat Sheet

For every service determine whether it is:

```text
Global
Regional
Zonal
Per-account/project
Per-VPC
Per-subnet
Per-cluster
Per-instance
```

This matters for:

- naming
- failover
- quotas
- IAM
- deletion
- disaster recovery

Never assume because a console page looks global that the data plane is global.

---

# Appendix B — Control Plane vs Data Plane

Control plane:

```text
create resource
update config
change route
create IAM policy
```

Data plane:

```text
serve HTTP request
read object
write database row
publish message
```

A control-plane outage does not always imply data-plane outage.

Good systems can sometimes continue serving using last-known-good configuration.

---

# Appendix C — Management Plane Isolation

Separate highly privileged management capabilities from application runtime.

Examples:

- CI/CD role can deploy app
- app role cannot edit its own IAM role
- security logging account cannot be modified by normal application role

This limits privilege escalation.

---

# Appendix D — Organization Policy

At enterprise scale, enforce:

```text
No public buckets
Approved regions only
Encryption required
MFA for privileged users
No unmanaged administrator accounts
```

Org-level policy prevents unsafe resources before they appear.

---

# Appendix E — Account Vending

A mature cloud platform can automatically provision a new account/project with:

- baseline IAM
- network
- audit logs
- security scanning
- budgets
- tags
- policy

This is much safer than manual setup.

---

# Appendix F — Break-Glass Access

Emergency access should be:

- rare
- strongly authenticated
- time-limited
- audited
- reviewed afterward

Avoid permanent shared admin passwords.

---

# Appendix G — Privileged Access Workstations

High-security environments may restrict privileged cloud administration to hardened devices or isolated administrative paths.

The idea is to reduce risk from compromised developer endpoints.

Use proportionally to threat model.

---

# Appendix H — Cloud Credential Rotation

Long-lived credentials should be minimized.

When unavoidable:

1. create new
2. deploy consumers
3. validate
4. revoke old
5. audit

For workload identity, tokens can rotate automatically.

---

# Appendix I — IAM Policy Evaluation

Cloud IAM often combines:

- identity policies
- resource policies
- organization guardrails
- permission boundaries
- explicit deny

Understand provider evaluation order before debugging "access denied."

---

# Appendix J — Cross-Account Access

Prefer assuming a role/service identity across account boundaries rather than distributing static credentials.

Benefits:

- temporary sessions
- central audit
- scoped trust

Trust policy and permission policy are separate concerns.

---

# Appendix K — Cloud Network Packet Walk

For a user request:

```text
User
 -> public DNS
 -> CDN/WAF
 -> public LB
 -> VPC route
 -> app security group
 -> application
 -> DB route/security group
 -> database
```

Troubleshoot one hop at a time.

---

# Appendix L — Return Path

Network communication needs a valid return path.

Asymmetric routing can break stateful firewalls and appliances.

When adding inspection/transit devices, verify both directions.

---

# Appendix M — NAT Port Exhaustion

A NAT device translating many outbound connections can exhaust available source ports per destination.

Symptoms:

- intermittent outbound failures
- connection timeouts

Mitigations:

- connection reuse
- multiple NAT IPs/devices
- private endpoints
- better connection management

---

# Appendix N — Egress Architecture

Enterprise egress options:

```text
Workload
 -> Central NAT
 -> Firewall
 -> Internet
```

or decentralized per VPC.

Centralized egress provides control but can add:

- cost
- latency
- blast radius

Choose deliberately.

---

# Appendix O — Ingress Architecture

Common:

```text
Internet
 -> DDoS protection
 -> CDN
 -> WAF
 -> global/regional LB
 -> API gateway/ingress
 -> application
```

Not every app needs every layer.

Use only layers that solve real requirements.

---

# Appendix P — TLS Termination

TLS can terminate at:

- edge
- load balancer
- ingress
- application

Internal re-encryption may use TLS/mTLS.

Define where plaintext is allowed.

Highly sensitive environments may require encryption end-to-end.

---

# Appendix Q — Private DNS

Private DNS can map internal names:

```text
db.internal.example
api.internal.example
```

Challenges:

- multiple VPCs
- hybrid resolution
- split horizon
- forwarding rules

DNS architecture becomes critical in hybrid/multi-account systems.

---

# Appendix R — DNS Failover Limitations

DNS failover is affected by:

- TTL
- recursive resolver cache
- client cache
- long-lived connection

Do not promise "instant failover" based solely on changing DNS.

---

# Appendix S — IPv6

IPv6 provides huge address space and can reduce NAT dependence.

Architects should understand:

- dual stack
- IPv6 routing
- firewall rules
- application compatibility

Do not ignore IPv6 in long-lived enterprise IP planning.

---

# Appendix T — Network Flow Logs

Flow logs help answer:

- who connected?
- source/destination
- port/protocol
- accepted/rejected

They are valuable for:

- security
- troubleshooting
- traffic analysis

But can generate significant telemetry volume.

---

# Appendix U — Network MTU

Encapsulation through:

- VPN
- overlay networks
- service mesh

can reduce usable MTU.

Symptoms:

- some large packets fail
- TLS connections behave strangely

Path MTU issues are rare but difficult.

---

# Appendix V — Load Balancer Draining

During deployment:

1. mark instance unhealthy/draining
2. stop new connections
3. complete in-flight requests
4. terminate process

Without draining, rolling deployments create 5xx errors.

---

# Appendix W — Sticky Sessions

Sticky sessions route a client to the same backend.

Useful sometimes, but create:

- uneven load
- failover issues
- state coupling

Prefer external session state where practical.

---

# Appendix X — Health Checks

Separate:

```text
liveness
readiness
dependency health
```

A deep health check that queries the database every second from thousands of instances can create unnecessary load.

---

# Appendix Y — Load Balancer Timeouts

Align:

```text
client timeout
edge timeout
LB timeout
app timeout
dependency timeout
```

If outer layer gives up first but inner work continues, resources are wasted.

---

# Appendix Z — Global Load Balancing and State

Global LB can route traffic anywhere.

Application state may not be globally available.

Always design:

```text
traffic placement
+
data placement
```

together.

---

# Appendix AA — CDN Cache Keys

Cache key may include:

- host
- path
- query parameters
- selected headers
- cookies

Under-keying can return wrong/private content.

Over-keying destroys cache hit ratio.

---

# Appendix AB — CDN Invalidation

Strategies:

- short TTL
- versioned asset names
- purge

For static assets:

```text
app.abc123.js
```

versioned filenames avoid complex invalidation.

---

# Appendix AC — Origin Protection

Do not let users bypass WAF/CDN and hit origin directly if security depends on edge controls.

Use:

- private origin
- firewall restrictions
- signed origin requests
- service-to-service authentication

---

# Appendix AD — DDoS Architecture

Protect different layers:

- volumetric network attacks
- protocol attacks
- application-level expensive requests

A CDN can absorb bandwidth, but a valid expensive API call may still overload backend.

Use application limits.

---

# Appendix AE — Instance Metadata Security

Cloud VMs expose metadata services for identity/config.

Protect against SSRF paths that could expose credentials.

Use hardened metadata settings and workload identity best practices.

---

# Appendix AF — Cloud SSRF

SSRF can let attackers access:

- metadata endpoints
- internal APIs
- private admin services

Mitigate:

- URL validation
- egress controls
- metadata hardening
- least privilege

---

# Appendix AG — Bastion Hosts

Traditional bastion:

```text
Admin
 -> Bastion
 -> Private Hosts
```

Modern alternatives:

- managed session systems
- zero-trust access proxies
- just-in-time access

Avoid exposing SSH broadly.

---

# Appendix AH — SSH Key Management

If SSH is required:

- no shared keys
- short-lived certificates where possible
- audit
- rotate/revoke
- restrict network paths

Prefer immutable infrastructure to frequent SSH administration.

---

# Appendix AI — VM Patch Management

Strategies:

- rebuild golden image
- automated patch orchestration
- rolling replacement

Patch:

- OS
- runtime
- agents

Track vulnerable image versions.

---

# Appendix AJ — Image Pipeline

Example:

```text
Base OS
 -> hardening
 -> runtime
 -> security scan
 -> test
 -> sign
 -> publish image
```

Production should deploy approved immutable versions.

---

# Appendix AK — Container Registry

Registry security:

- private repositories
- IAM
- vulnerability scanning
- immutable tags/digests
- provenance

Deploy by digest for strong immutability when appropriate.

---

# Appendix AL — Container Image Size

Large images cause:

- slow pulls
- slow autoscaling
- more storage/network

Use multi-stage builds and minimal runtime images.

Do not remove necessary diagnostics blindly.

---

# Appendix AM — Container Supply Chain

Track:

- base image
- dependencies
- build provenance
- signatures
- SBOM

A compromised build pipeline can compromise every deployment.

---

# Appendix AN — Kubernetes Control Plane

Managed Kubernetes provider usually owns control-plane availability.

You still own:

- workload configuration
- node pools
- pod resources
- network
- RBAC
- upgrades coordination

Understand which component's SLA covers which failure.

---

# Appendix AO — Kubernetes Node Pools

Separate pools by:

- workload class
- architecture
- GPU
- spot/preemptible
- security requirements

Use taints/tolerations/affinity carefully.

Too many pools increase fragmentation.

---

# Appendix AP — Kubernetes Pod Requests and Limits

Requests affect scheduling.

Limits constrain.

Too-low CPU limit:

- throttling
- high latency

Too-low memory limit:

- OOM kills

Set based on measurements.

---

# Appendix AQ — Kubernetes Autoscaling Layers

Potential layers:

```text
HPA scales pods
Cluster autoscaler scales nodes
Cloud autoscaling provides nodes
```

Scaling one layer can wait on another.

Cold-start timing matters.

---

# Appendix AR — Kubernetes Disruption Budgets

A PodDisruptionBudget can limit voluntary disruption during:

- node drain
- upgrades

It cannot guarantee availability during involuntary failures.

Use with capacity planning.

---

# Appendix AS — Kubernetes Network Policies

Network policies restrict pod traffic.

They complement:

- cloud security groups
- IAM
- service identity

Verify your CNI/network provider actually enforces them.

---

# Appendix AT — Kubernetes Secrets

Kubernetes Secret objects are not automatically strong secret management in every deployment.

Consider:

- encryption at rest
- external secret managers
- access controls
- rotation

Do not commit plaintext manifests with secrets.

---

# Appendix AU — Kubernetes Ingress vs Gateway

Ingress/Gateway APIs expose application traffic.

The actual cloud load balancer/controller behavior varies.

Understand:

- TLS
- health checks
- path routing
- internal vs public load balancer

---

# Appendix AV — Serverless Cold Starts

Cold starts depend on:

- runtime
- package size
- initialization
- networking
- provisioned/warm capacity

Avoid heavy global initialization if latency-sensitive.

---

# Appendix AW — Serverless Concurrency

One traffic spike can create thousands of concurrent function executions.

If each opens DB connection:

```text
1000 functions -> 1000 DB connections
```

Use:

- DB proxies
- connection reuse
- concurrency caps
- queues

---

# Appendix AX — Serverless Retry Semantics

Event-driven functions may be retried automatically.

You must know:

- retry count
- backoff
- DLQ destination
- duplicate behavior

Function code should be idempotent.

---

# Appendix AY — Serverless Cost Traps

Serverless can be expensive for:

- long-running high-volume compute
- chatty architectures
- huge logs
- high data transfer

Compare unit economics against containers/VMs.

---

# Appendix AZ — Spot / Preemptible Compute

Cheaper but interruptible.

Good for:

- batch
- stateless workers
- CI
- distributed compute

Need:

- interruption handling
- checkpointing
- mixed capacity

Do not run irreplaceable single-stateful component only on interruptible capacity.

---

# Appendix BA — Capacity Reservations

For critical launches or scarce GPUs, reserved capacity may ensure availability.

Autoscaling cannot create hardware that provider does not currently have.

Plan for constrained instance families.

---

# Appendix BB — Compute Commitments

Reserved/committed usage can reduce cost for stable workloads.

Risk:

- overcommit to wrong type/region

Use after measuring baseline.

---

# Appendix BC — Right-Sizing

Look at:

- CPU
- memory
- network
- I/O
- p95/p99 load

Average CPU alone is insufficient.

A memory-bound service can show low CPU while needing large instance.

---

# Appendix BD — Bin Packing

Container schedulers pack workloads onto nodes.

Poor resource requests cause:

- wasted capacity
- overload
- fragmentation

Right-size requests, not only limits.

---

# Appendix BE — Resource Overcommit

Some platforms overcommit CPU because workloads rarely peak together.

Memory overcommit is riskier because exhaustion can cause OOM.

Know platform semantics.

---

# Appendix BF — Object Storage Versioning

Versioning protects against:

- accidental overwrite
- deletion

But increases cost.

Lifecycle old versions.

Versioning does not replace separate backup for every threat model.

---

# Appendix BG — Object Storage Replication

Replicate across:

- regions
- accounts

for DR/compliance.

Consider:

- replication lag
- delete markers
- encryption keys
- cost

---

# Appendix BH — Object Lock / Immutability

Immutable retention can protect backups from deletion/ransomware.

Use separate administrative controls.

Be careful with legal retention because immutable data cannot be casually removed.

---

# Appendix BI — Storage Encryption

Cloud storage often supports managed encryption by default/option.

Choices:

- provider-managed key
- customer-managed key
- application encryption

More key control brings more operational responsibility.

---

# Appendix BJ — Storage Access Policies

Avoid public access.

Use:

- IAM
- resource policies
- presigned URLs

Block-public-access controls can provide organization-wide safety.

---

# Appendix BK — Multipart Uploads

Large object upload can split into parts.

Benefits:

- retry individual part
- parallel upload
- resume

Clean abandoned multipart uploads.

---

# Appendix BL — Object Events

Object storage can emit events for processing.

Assume:

- duplicates
- ordering limitations

Use object version/generation identifiers.

---

# Appendix BM — Block Storage Snapshots

Snapshots may be crash-consistent, not application-consistent.

For databases, coordinate:

- database backup mechanism
- filesystem freeze
- transaction logs

depending on engine.

---

# Appendix BN — Storage Throughput Caps

Cloud disks often have limits based on:

- volume size
- tier
- instance size

A high-performance disk attached to low-bandwidth VM may still be bottlenecked by VM.

Performance is end-to-end.

---

# Appendix BO — File Storage Hotspots

Shared filesystem can bottleneck due to:

- metadata operations
- many small files
- lock contention

Benchmark actual access pattern.

---

# Appendix BP — Data Lifecycle Governance

Every dataset should define:

- owner
- classification
- retention
- backup
- deletion
- residency
- access

Cloud makes storage cheap enough to accumulate data forever—but risk grows too.

---

# Appendix BQ — Database Connection Proxies

Managed DB proxies can:

- pool connections
- absorb connection spikes
- simplify failover

But add:

- cost
- latency
- transaction/session limitations

Understand compatibility.

---

# Appendix BR — Database Failover

During managed failover:

- connections drop
- DNS may change
- read/write roles change

Applications need:

- retry
- idempotency
- connection pool recovery

Do not assume failover is transparent to every in-flight transaction.

---

# Appendix BS — Read Replicas

Use for:

- scale
- reporting
- geographic reads

Risks:

- replication lag
- stale read
- lag during load

Define read consistency explicitly.

---

# Appendix BT — Database Multi-AZ vs Read Replica

Multi-AZ standby commonly targets availability.

Read replica commonly targets read scaling.

Exact semantics vary by provider/engine.

Do not use a read replica as backup.

---

# Appendix BU — Database Backup Retention

Set based on:

- business recovery
- legal needs
- cost

Keep point-in-time recovery logs long enough for operational needs.

Test restores to isolated environments.

---

# Appendix BV — Database Encryption Keys

If database uses customer-managed key:

- protect key policy
- ensure DR region access
- plan rotation
- prevent accidental key deletion

Losing key can make data unrecoverable.

---

# Appendix BW — NoSQL Partition Capacity

Partitioned stores can throttle hot keys.

Example bad key:

```text
partition_key = current_date
```

All today's traffic hits one partition.

Use high-cardinality distribution.

---

# Appendix BX — Provisioned vs On-Demand Capacity

Some cloud databases offer:

- provisioned throughput
- autoscaled/on-demand

Provisioned can be cost-efficient at predictable volume.

On-demand simplifies bursty workloads.

Understand billing and throttling behavior.

---

# Appendix BY — Global Tables

Global replication can improve regional access.

But clarify:

- conflict policy
- consistency
- replication lag
- failover

Global does not mean magic serializable consistency.

---

# Appendix BZ — Cache Topology

Cache can be:

- single node
- replica
- cluster/sharded

Choose based on:

- size
- HA
- throughput

Plan cache reshard/failover behavior.

---

# Appendix CA — Cache Persistence

If using cache for important state, understand:

- persistence
- snapshots
- logs
- failover

Do not assume an in-memory service gives database-level durability.

---

# Appendix CB — Analytics Separation

Heavy BI query should not compete with checkout DB.

Replicate data to:

- warehouse
- lake
- read replica

depending on freshness and complexity.

---

# Appendix CC — Data Pipeline Idempotency

ETL/ELT jobs should be restartable.

Use:

- partition checkpoints
- deterministic output
- idempotent writes

A failed job should not duplicate 100 GB of data.

---

# Appendix CD — Data Lake Partitioning

Partition files by common filter dimensions, e.g.:

```text
date
region
tenant
```

Avoid extremely high-cardinality tiny partitions.

Too many small files hurt performance.

---

# Appendix CE — Data Catalog

Catalog tracks:

- datasets
- schema
- owners
- locations
- classifications

Important for governance and discovery.

---

# Appendix CF — Data Lineage

Lineage:

```text
Source DB
 -> CDC
 -> Raw Lake
 -> Transformation
 -> Warehouse Table
 -> Dashboard
```

Needed for:

- deletion
- debugging
- compliance
- schema change

---

# Appendix CG — Streaming Capacity

Estimate:

```text
events/sec
event bytes
partition throughput
consumer processing
retention
```

A broker has finite throughput.

Over-partitioning also has operational cost.

---

# Appendix CH — Stream Retention

Retention enables:

- replay
- recovery
- new consumers

Long retention increases storage cost.

Choose based on actual replay requirements.

---

# Appendix CI — Queue Visibility Timeout

Worker receives message and it becomes invisible temporarily.

If processing exceeds timeout, another worker may receive it.

Use:

- lease extension
- idempotency
- appropriate timeout

---

# Appendix CJ — DLQs

Dead-letter queue must have:

- alert
- ownership
- replay tooling
- runbook

A DLQ nobody watches is data loss with extra steps.

---

# Appendix CK — Event Bus Governance

Define:

- topic/event names
- owner
- schema
- retention
- access
- PII classification

Without governance, event platforms become dependency chaos.

---

# Appendix CL — Event Schemas

Use backward-compatible evolution.

Avoid:

- changing field meaning
- removing required field abruptly
- reusing field identifiers

Treat event schema as long-lived API.

---

# Appendix CM — Serverless Workflows

Managed workflow services can coordinate:

- functions
- timers
- retries
- branches

Useful for business processes.

Be aware of:

- per-transition cost
- service limits
- provider coupling

---

# Appendix CN — API Gateway Limits

Gateways often impose:

- payload limits
- timeout limits
- rate limits

Long-running APIs may need async job pattern instead of gateway request held for minutes.

---

# Appendix CO — Gateway Authentication

Central gateway can validate identity.

Backends still need authorization.

Do not assume because request came through gateway it can access every object.

---

# Appendix CP — Internal APIs

Internal services can use private load balancers or service discovery.

But internal traffic still needs:

- identity
- authorization
- timeout
- observability

Private does not mean trusted.

---

# Appendix CQ — Service Mesh mTLS

Mesh can automatically issue workload certificates.

Operational concerns:

- certificate rotation
- control plane
- proxy resource overhead

Understand degraded behavior if mesh control plane fails.

---

# Appendix CR — Retry Ownership

If mesh retries and application retries:

```text
2 app attempts × 3 mesh attempts = 6
```

Potential amplification.

Define one primary retry layer.

---

# Appendix CS — Configuration Distribution

Dynamic config should use:

- version
- validation
- last-known-good
- rollback
- audit

A bad global config push can fail every region faster than code deployment.

---

# Appendix CT — Feature Flags

Cloud systems often use feature flags for rollout.

Flags need:

- owner
- expiry
- audit
- safe default

Stale flags create permanent complexity.

---

# Appendix CU — Secrets Rotation Without Downtime

Dual-secret approach:

1. add new secret
2. consumers accept/use both
3. switch producer/client
4. wait
5. revoke old

Rotation must account for connection pools and cached credentials.

---

# Appendix CV — KMS Envelope Encryption

Typical:

```text
Generate data key
 -> encrypt payload locally
 -> store encrypted payload + encrypted data key
```

KMS is not used for encrypting every large byte directly in many architectures.

---

# Appendix CW — Key Deletion

Key deletion can be catastrophic.

Use:

- deletion waiting period
- approvals
- backups
- separate permissions

Treat encryption keys as critical state.

---

# Appendix CX — Key Rotation

Rotation may mean:

- new encryptions use new version
- old ciphertext still decrypted by older version

Understand provider behavior.

Application-level re-encryption may be needed for some compliance requirements.

---

# Appendix CY — Private Certificate Authority

Internal PKI can issue certificates for:

- services
- devices
- mTLS

Protect CA keys strongly.

Plan CA rotation and trust-bundle overlap.

---

# Appendix CZ — Cloud Security Posture Management

Security posture tools can identify:

- public storage
- open ports
- weak IAM
- disabled logging
- vulnerable images

Prioritize findings based on exploitability and asset sensitivity.

Thousands of unprioritized alerts do not improve security.

---

# Appendix DA — Security Baselines

Baseline controls:

- MFA
- no root/admin daily use
- centralized audit
- encrypted storage
- private DB
- backup
- vulnerability scanning
- secret management

Automate these into landing zone.

---

# Appendix DB — Cloud Threat Modeling

Identify:

- assets
- actors
- trust boundaries
- entry points
- data flows

Ask:

- What if account credential leaks?
- What if workload is compromised?
- What if CI pipeline is compromised?
- What if storage policy is wrong?

---

# Appendix DC — Cloud Supply Chain Security

Cloud supply chain includes:

- source code
- dependencies
- build runners
- container registry
- IaC modules
- deployment credentials

Protect the path from commit to production.

---

# Appendix DD — CI/CD Identity

CI should use short-lived federated credentials where possible.

Avoid storing permanent cloud admin keys in CI secrets.

Scope deployment roles per environment.

---

# Appendix DE — Environment Separation

Production should have stronger isolation from:

- developer laptops
- development credentials
- test data

Separate accounts/projects reduce accidental cross-environment actions.

---

# Appendix DF — Centralized Audit Account

Security logs stored separately prevent application administrators from easily deleting evidence.

Use restricted access and immutable retention where appropriate.

---

# Appendix DG — Encryption in Transit

Encrypt:

- public traffic
- service-to-service
- database connections
- hybrid links

Use modern TLS.

Do not disable validation to bypass certificate problems.

---

# Appendix DH — Egress Filtering

Restrict outbound destinations for sensitive workloads.

Benefits:

- reduce exfiltration
- block command-and-control

Costs:

- maintenance
- third-party IP/domain changes

Use proxies/domain-aware controls where needed.

---

# Appendix DI — WAF Rule Tuning

Too strict:

- false positives

Too loose:

- limited protection

Monitor in detection/count mode before enforcing high-risk rules when possible.

---

# Appendix DJ — Rate Limiting at Edge

Edge throttling protects origin before traffic consumes application resources.

Use different limits for:

- anonymous
- authenticated
- expensive endpoints

But application may still need per-business-account limits.

---

# Appendix DK — Audit Trail

Record:

- who changed infrastructure
- what changed
- when
- source
- result

Cloud control-plane audit is critical for incident response.

---

# Appendix DL — Infrastructure Change Approval

Not every change needs manual approval.

Automate low-risk changes.

Require stronger review for:

- network core
- IAM
- key policy
- production database
- global traffic

Risk-based controls scale better than universal bureaucracy.

---

# Appendix DM — Policy as Code

Examples:

```text
deny public bucket
deny unencrypted database
require owner tag
deny public SSH
```

Run in:

- CI
- admission control
- cloud organization policy

---

# Appendix DN — Terraform State Security

State can contain:

- resource IDs
- configuration
- sometimes sensitive values

Protect:

- encryption
- IAM
- locking
- backups

Do not expose state broadly.

---

# Appendix DO — Terraform Module Versioning

Shared modules should use explicit versions.

Breaking a module used by 500 stacks can cause wide impact.

Use:

- semantic releases
- changelog
- migration guide
- compatibility

---

# Appendix DP — Terraform Import

Import existing resources carefully.

Import only maps resource to state; configuration still needs to match actual resource.

Run plan and resolve drift.

---

# Appendix DQ — Terraform Destroy Risk

Production destroy permissions should be tightly controlled.

Use:

- protected resources
- deletion prevention
- backups
- review

Automation can delete infrastructure faster than humans can react.

---

# Appendix DR — IaC Dependency Graphs

Declarative tools infer dependency from references.

Manual `depends_on`-style controls should be used only when dependency is real but implicit.

Too many explicit dependencies reduce parallelism and clarity.

---

# Appendix DS — Drift Detection

Run scheduled plan/diff.

Classify drift:

- authorized emergency change
- provider-managed mutation
- accidental console change

Reconcile deliberately.

---

# Appendix DT — GitOps Reconciliation Risk

A GitOps controller can rapidly reapply a bad state.

Use:

- staged promotion
- policy checks
- protected branches
- progressive rollout

Automation amplifies both good and bad changes.

---

# Appendix DU — Deployment Artifact Immutability

Build once.

Promote same artifact:

```text
dev
 -> staging
 -> production
```

Do not rebuild source separately for production and hope it is identical.

---

# Appendix DV — Blue/Green Cloud Deployment

Two environments:

```text
Blue = current
Green = new
```

Switch traffic.

Benefits:

- easy rollback

Costs:

- duplicate capacity
- database compatibility

---

# Appendix DW — Canary Deployment

Route:

```text
1%
5%
25%
50%
100%
```

Observe:

- error rate
- latency
- business metrics

Automate stop if regression.

---

# Appendix DX — Shadow Traffic

Duplicate real requests to new system but do not use response.

Useful for:

- performance
- correctness comparison

Prevent side effects in shadow path.

---

# Appendix DY — Rollback and Data

Code rollback may be unsafe if new version wrote incompatible data.

Use expand/contract migrations.

Sometimes roll-forward is safer.

---

# Appendix DZ — Infrastructure Rollback

Infrastructure rollback may not be simple:

- deleted data
- changed DNS
- rotated key
- recreated DB

Design reversibility before applying.

---

# Appendix EA — Logs as a Cost Center

Logging cost can include:

- ingestion
- storage
- search
- export

Reduce:

- noisy success logs
- giant payloads
- long retention

Do not remove necessary audit/security logs to save money.

---

# Appendix EB — Metrics Cardinality

Labels such as:

```text
user_id
request_id
full URL
```

can explode costs.

Use bounded dimensions:

```text
route
status
region
service
```

---

# Appendix EC — Trace Sampling

Strategies:

- head sampling
- tail sampling
- error-biased sampling

Keep enough traces for rare failures.

---

# Appendix ED — Cloud Audit Log Retention

Control-plane audit logs often need longer retention than debug logs.

Protect them separately.

---

# Appendix EE — Multi-Region Observability

Dashboards should compare regions:

- traffic
- error
- latency
- replication lag
- capacity

A regional failure may look healthy in global average.

---

# Appendix EF — Synthetic Monitoring

Run synthetic user paths from multiple geographies:

```text
DNS
login
API
DB write
read
```

Detect problems external to service metrics.

---

# Appendix EG — Business Monitoring

Monitor:

- orders
- payments
- signups
- file processing success

Technical metrics can be green while product logic is broken.

---

# Appendix EH — SLO by User Journey

Prefer:

```text
checkout success
```

over:

```text
VM uptime
```

User-centric SLOs align architecture with business.

---

# Appendix EI — Multi-AZ Capacity Math

If you operate across 3 AZs and require surviving 1 AZ loss:

Each remaining 2 AZs must together handle full traffic.

Normal capacity should leave headroom.

---

# Appendix EJ — Failure Capacity

A system designed to use 95% of every resource during normal traffic has little resilience.

Plan spare capacity for:

- AZ failure
- deployments
- bursts
- maintenance

---

# Appendix EK — Region Evacuation

A multi-region system should test:

- remove one region from traffic
- fail database writer
- restore capacity elsewhere
- validate secrets
- validate queues

Hidden regional dependencies are common.

---

# Appendix EL — DR Tiering

Classify workloads:

```text
Tier 0: identity, payments, routing
Tier 1: core APIs
Tier 2: notifications
Tier 3: analytics
```

Not every service needs same RTO/RPO.

---

# Appendix EM — Backup vs Replication

Replication protects availability.

Backup protects from logical destruction.

If production deletes every row, replication can faithfully copy deletion.

Need both.

---

# Appendix EN — Immutable Backups

Keep protected backup copy outside normal production credentials.

Useful against:

- ransomware
- accidental mass deletion
- compromised administrator

---

# Appendix EO — Point-In-Time Recovery

PITR can restore database to time before logical corruption.

Plan:

- target time
- isolated restore
- validation
- traffic cutover
- downstream reconciliation

---

# Appendix EP — Restore Drills

Test:

- backup availability
- key access
- actual restore time
- application compatibility

Measure RTO, do not guess it.

---

# Appendix EQ — Failover Fencing

When promoting secondary, prevent old primary from accepting writes.

Otherwise split brain.

Use provider-supported fencing/consensus mechanisms.

---

# Appendix ER — Failback Data Reconciliation

Before moving back:

- synchronize
- compare data
- verify replication
- ensure old region has latest state

Failback without validation can reintroduce stale data.

---

# Appendix ES — Active-Active Conflict Resolution

Possible:

- last-write-wins
- application merge
- home-region ownership
- conflict-free data type
- globally coordinated transaction

Choose based on domain.

"Just replicate both ways" is not a conflict strategy.

---

# Appendix ET — Home Region Pattern

Assign entity/tenant a home region.

Writes go there.

Reads may be global.

Benefits:

- avoids multi-writer conflict
- supports residency

Requires routing metadata and migration process.

---

# Appendix EU — Global Session Design

Sessions may be:

- region-local
- globally replicated
- token-based

Trade-offs:

- latency
- failover
- revocation

Design session behavior during region loss.

---

# Appendix EV — Global Identity Dependency

If all regions synchronously call one identity service in one region, you do not have regional independence.

Cache validation keys and design local token verification where appropriate.

---

# Appendix EW — Regionalized Dependencies

Map every critical dependency by region:

```text
App
DB
Cache
Queue
Secrets
KMS
Registry
DNS
Identity
```

A single non-replicated dependency defeats multi-region claims.

---

# Appendix EX — Chaos in Cloud

Test realistic cloud failures:

- IAM deny
- AZ node loss
- DNS failure
- KMS access denial
- network latency
- quota throttle

Not only `kill -9` a process.

---

# Appendix EY — Provider Outage Strategy

You cannot prevent provider outage.

Choose:

- tolerate
- multi-region
- multi-cloud

based on business impact.

Multi-cloud DR may be far more expensive than accepting a rare region outage.

---

# Appendix EZ — Provider API Throttling

Control-plane APIs have rate limits.

Bulk provisioning may hit throttling.

Use:

- exponential backoff
- batching
- staged operations

Do not create thousands of resources in a tight loop without limits.

---

# Appendix FA — Quota Runway

Track:

```text
used / quota
```

and projected growth.

Example:

```text
85% IP addresses used
growth 2%/week
```

Act before deployment failure.

---

# Appendix FB — IP Exhaustion

Kubernetes and private endpoints can consume many IPs.

Symptoms:

- pods cannot schedule
- endpoints cannot create

Plan address space early.

---

# Appendix FC — DNS Query Limits

Resolvers/services can have quotas.

Highly chatty applications that resolve DNS for every request can cause needless load.

Reuse connections.

---

# Appendix FD — Connection Reuse

Long-lived clients should reuse:

- TCP
- TLS
- DB connections

Benefits:

- lower latency
- lower CPU
- reduced NAT ports

---

# Appendix FE — Cross-Zone Data Transfer Cost

Some providers charge cross-zone transfer.

Architecture that constantly crosses AZs may have hidden cost.

Balance:

- resilience
- locality
- cost

Do not compromise HA solely to avoid small transfer cost without analysis.

---

# Appendix FF — Cross-Region Cost

Cross-region replication and APIs can be expensive.

Measure:

```text
bytes/sec × price × month
```

Global architecture has recurring network economics.

---

# Appendix FG — NAT Cost

Managed NAT can charge:

- hourly
- per GB

Large object downloads through NAT may be unnecessarily expensive.

Use private endpoints or direct paths where appropriate.

---

# Appendix FH — Idle Resource Cost

Common waste:

- dev clusters running nights/weekends
- unattached disks
- old snapshots
- idle load balancers
- oversized DBs
- unused public IPs

Automate cleanup.

---

# Appendix FI — Cost Anomaly Detection

Alert when service spend deviates significantly from baseline.

Possible causes:

- traffic spike
- logging bug
- loop
- compromised credential
- forgotten resource

Cost is an operational signal.

---

# Appendix FJ — Budget Guardrails

Budgets can notify, but hard shutdown on budget limit may be dangerous for production.

Use environment-specific policies.

Development can be aggressively capped.

Production requires controlled response.

---

# Appendix FK — Unit Economics

For SaaS:

```text
cost / active tenant
cost / transaction
cost / GB processed
```

helps compare architecture choices.

---

# Appendix FL — Reserved vs On-Demand Economics

Stable baseline:

- commitments can reduce cost

Variable burst:

- on-demand/spot

Portfolio should match workload shape.

---

# Appendix FM — Autoscaling and Cost

Autoscaling can reduce idle cost.

But scale-to-zero can increase cold-start latency.

Choose based on SLO.

---

# Appendix FN — FinOps Ownership

Teams should see cost for the systems they design.

Central FinOps provides:

- tools
- rates
- standards

Engineering teams act on optimization.

---

# Appendix FO — SaaS Tenant Metering

Meter usage:

- API calls
- storage
- compute
- seats
- messages

Metering itself must be:

- reliable
- auditable
- idempotent

Billing errors are customer trust issues.

---

# Appendix FP — Tenant Quotas

Use quotas to control noisy neighbors.

Examples:

- RPS
- storage
- concurrent jobs

Return explicit quota errors.

---

# Appendix FQ — Dedicated Tenants

Large/regulatory tenants may get:

- dedicated DB
- dedicated cluster
- dedicated account

This increases isolation and cost.

Automate provisioning.

---

# Appendix FR — Tenant Routing

Maintain mapping:

```text
tenant -> region -> cell -> database
```

Routing data becomes critical control-plane state.

Cache with last-known-good behavior.

---

# Appendix FS — Tenant Migration

Move tenant:

1. copy data
2. capture changes
3. validate
4. pause/switch writes
5. update routing
6. verify
7. clean old

Make operation restartable.

---

# Appendix FT — Cell-Based Architecture

A cell is independent slice:

```text
LB
App
Cache
DB
Queue
```

serving subset of tenants.

Benefits:

- bounded blast radius
- horizontal scale

Requires tenant/cell routing.

---

# Appendix FU — Cell Failure

If one cell fails, only its tenants should be impacted.

This is stronger isolation than one global database.

At very large scale, cells are powerful.

---

# Appendix FV — Cloud Migration Discovery

Inventory:

- servers
- databases
- integrations
- DNS
- certificates
- batch jobs
- file shares
- cron
- licensing

Hidden dependencies break migrations.

---

# Appendix FW — Dependency Mapping

Build graph:

```text
App A -> DB A
App A -> App B
App B -> mainframe
```

Migrate by dependency groups/waves.

---

# Appendix FX — Migration Wave Planning

Group workloads by:

- dependencies
- business criticality
- complexity
- team readiness

Start with representative low-risk workloads.

---

# Appendix FY — Rehost

Move VM mostly unchanged.

Pros:

- fast

Cons:

- carries old architecture/cost

Useful as interim step.

---

# Appendix FZ — Replatform

Change some components:

```text
VM DB -> managed DB
```

without rewriting whole application.

Often provides good value/risk balance.

---

# Appendix GA — Refactor

Change architecture deeply.

Use for systems where:

- scaling
- reliability
- velocity

justify investment.

Do not refactor everything during initial migration.

---

# Appendix GB — Retire

Some applications should be deleted rather than migrated.

Cloud migration is an opportunity to reduce portfolio.

---

# Appendix GC — Retain

Some systems may remain on-prem:

- hardware dependency
- latency
- regulation
- end-of-life soon

Cloud strategy can intentionally include retained systems.

---

# Appendix GD — Repurchase

Replace custom system with SaaS.

Evaluate:

- migration
- customization
- integration
- vendor risk
- recurring cost

---

# Appendix GE — Migration Cutover

Before cutover:

- replication caught up
- test complete
- DNS TTL considered
- rollback ready
- support/on-call ready

After:

- verify data
- verify business flows
- monitor

---

# Appendix GF — Migration Rollback

Rollback may require:

- reverse replication
- write freeze
- reconciliation

If data is written in cloud after cutover, simply pointing DNS back can lose data.

Plan before migration.

---

# Appendix GG — Hybrid Identity

During migration, identity may span:

- on-prem directory
- cloud SSO
- SaaS

Use federation.

Avoid duplicate user lifecycle systems.

---

# Appendix GH — Hybrid DNS

On-prem must resolve cloud private names and vice versa.

Configure:

- conditional forwarders
- private zones
- resolver endpoints

DNS is often the hardest hidden hybrid dependency.

---

# Appendix GI — Hybrid Routing

Ensure no CIDR overlap.

Plan:

- route advertisements
- asymmetric paths
- firewall inspection

Document ownership between network teams.

---

# Appendix GJ — Cloud Exit Strategy

For critical provider-specific services, document:

- export format
- data ownership
- migration lead time
- alternative

You do not need immediate portability, but should understand exit cost.

---

# Appendix GK — Multi-Cloud Networking

Connecting clouds introduces:

- VPN/dedicated links
- routing
- DNS
- encryption
- egress cost

Cross-cloud synchronous chatter is often expensive and fragile.

---

# Appendix GL — Multi-Cloud Identity

Use central identity provider and federation.

Avoid separate unmanaged user directories in every cloud.

---

# Appendix GM — Multi-Cloud Observability

Centralize or federate telemetry.

Need common:

- service names
- trace context
- labels
- SLO definitions

Do not let each cloud become an operational silo.

---

# Appendix GN — Multi-Cloud Data

Replicating data across providers is difficult due to:

- bandwidth
- egress cost
- consistency
- service differences

Use only where business value justifies it.

---

# Appendix GO — Cloud Operating Roles

Common responsibilities:

- cloud platform
- security
- networking
- application teams
- FinOps
- SRE

Define ownership clearly.

---

# Appendix GP — Platform Team as Product Team

Platform customers are developers.

Track:

- adoption
- satisfaction
- lead time
- support burden

Do not build platform features without user demand.

---

# Appendix GQ — Golden Paths

Provide standard way to:

```text
create service
deploy
get DB
get secret
observe
```

Defaults should be secure and reliable.

Allow escape hatches for legitimate needs.

---

# Appendix GR — Platform APIs

Prefer self-service APIs/portals over manual tickets.

Automation reduces:

- lead time
- inconsistency
- human error

---

# Appendix GS — Platform Abstraction Depth

Do not hide every cloud concept.

Developers still need to understand:

- latency
- scaling
- quotas
- failure

A platform should remove repetitive complexity, not obscure reality.

---

# Appendix GT — Shared Service Blast Radius

Central services like:

- auth
- config
- DNS
- secrets
- service discovery

can impact every team.

Design them for:

- high reliability
- graceful degradation
- regional independence

---

# Appendix GU — Control Plane Independence

Data plane should often continue if control plane temporarily unavailable.

Example:

```text
config service unavailable
 -> app uses cached last-known-good config
```

This reduces global outages.

---

# Appendix GV — Organization-Wide Observability Platform

Provide standard:

- log format
- metrics
- tracing
- dashboards
- SLO tooling

Prevent each team building incompatible telemetry stack.

---

# Appendix GW — Organization-Wide Identity Platform

Central identity should provide:

- workload identity
- user SSO
- token verification
- role standards

Avoid application teams inventing authentication independently.

---

# Appendix GX — Organization-Wide Network Platform

Network platform can provide:

- VPC vending
- DNS
- connectivity
- firewall policy
- private endpoints

Self-service with guardrails is better than ticket-based networking.

---

# Appendix GY — Cloud Governance at Scale

Automate:

- resource inventory
- security posture
- tagging
- budget
- quota
- ownership

Unknown/unowned resources are risk.

---

# Appendix GZ — Resource Ownership

Every production resource should have:

```text
owner
service
environment
purpose
```

Ownership enables:

- incident routing
- cost
- lifecycle
- security response

---

# Appendix HA — Decommissioning

Migration or project is not done until old resources are removed.

Checklist:

- zero traffic
- zero dependencies
- backup/retention decision
- revoke credentials
- remove DNS
- delete compute
- archive logs
- stop alerts

Dead resources cost money and create risk.

---

# Appendix HB — Architecture Decision Records

Record important decisions:

```markdown
# ADR

## Context
## Decision
## Alternatives
## Consequences
## Migration
## Reversal
```

Preserve reasoning.

---

# Appendix HC — Cloud Design Document

A strong cloud RFC includes:

1. problem
2. requirements
3. non-goals
4. scale
5. regions
6. network
7. IAM
8. compute
9. storage/data
10. security
11. observability
12. HA/DR
13. cost
14. deployment
15. migration
16. ownership
17. alternatives
18. risks

---

# Appendix HD — Reversible vs Irreversible Decisions

Easy to reverse:

- instance type
- minor autoscaling setting

Hard to reverse:

- region strategy
- partition key
- account hierarchy
- public API
- global data model

Spend more design effort on hard-to-reverse choices.

---

# Appendix HE — Architecture Risk Register

Example:

| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| NAT cost unexpectedly high | Medium | Medium | private endpoints + cost test |
| DB cannot handle peak writes | Medium | High | load test + scaling plan |
| DR restore exceeds RTO | Medium | High | quarterly restore drills |
| IAM role too broad | Medium | High | policy validation |

Make risks explicit.

---

# Appendix HF — Cloud Cost Review Questions

- What drives monthly cost?
- What changes at 10× traffic?
- Is egress material?
- Is NAT material?
- Is logging material?
- Are workloads right-sized?
- What is cost per unit?
- Can cold data move to cheaper tier?
- Is managed service premium worth reduced operations?

---

# Appendix HG — Cloud Reliability Review Questions

- Which AZ failures are tolerated?
- Which region failures?
- Which shared service can fail globally?
- Is backup tested?
- What is actual RPO/RTO?
- How does DB failover affect connections?
- Is there overload protection?
- Is failback documented?

---

# Appendix HH — Cloud Security Review Questions

- Where are trust boundaries?
- How do humans authenticate?
- How do workloads authenticate?
- Where are long-lived credentials?
- Which resources are public?
- Is egress controlled?
- Are logs protected?
- Are keys separable from data?
- Can compromised app edit its own IAM?

---

# Appendix HI — Networking Review Questions

- CIDR overlaps?
- public endpoints?
- egress path?
- DNS resolution?
- return routes?
- hybrid connectivity?
- private endpoint usage?
- central hub blast radius?
- network quotas?

---

# Appendix HJ — Compute Review Questions

- Why this compute model?
- startup time?
- scaling speed?
- interruption handling?
- patching?
- capacity shortage?
- resource limits?
- operating burden?

---

# Appendix HK — Data Review Questions

- source of truth?
- durability?
- replicas?
- backups?
- restore?
- encryption?
- retention?
- region?
- consistency?
- migration?

---

# Appendix HL — Platform Review Questions

- what repetitive work is removed?
- how is self-service provided?
- what defaults are enforced?
- what is escape hatch?
- who operates platform?
- what is platform SLO?
- how is adoption measured?

---

# Appendix HM — Senior Cloud Thinking

Senior engineer asks:

> How does this architecture behave under failure, load, and change?

not only:

> Which service should I click in the console?

---

# Appendix HN — Staff Cloud Thinking

Staff engineer asks:

> How should multiple teams build and operate cloud systems safely for years?

This involves:

- organizational design
- reusable platforms
- policies
- migration
- economics
- blast-radius control

---

# Appendix HO — Final Cloud Mental Model

For every architecture, evaluate:

## Identity
Who is calling?

## Network
How does traffic flow?

## Compute
Where does code execute?

## Data
Where is source of truth?

## Security
Which trust boundaries exist?

## Failure
What if zone/region/dependency fails?

## Scale
What is bottleneck at 10×?

## Operations
How do we observe and recover?

## Delivery
How is change deployed and rolled back?

## Cost
What drives spend?

## Evolution
How do we migrate or decommission?

If you can answer these precisely, you are thinking like a cloud architect.

---

# End

Mastery is not memorizing service names. Mastery is being able to choose appropriate abstractions, understand how they fail, secure them correctly, operate them reliably, estimate their economics, and evolve the architecture without unnecessary risk.
