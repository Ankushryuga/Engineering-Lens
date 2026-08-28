```
                              INTERNET
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    Route 53     │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ CloudFront + AWS WAF    │
                    │ TLS certificate / ACM   │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
           Default origin                 /api/* + /ws/*
                 │                               │
                 ▼                               ▼
          ┌─────────────┐                CloudFront
          │ Private S3  │                VPC Origin
          │ React build │                     │
          └─────────────┘                     ▼
                                      ┌────────────────┐
                                      │ Internal ALB   │
                                      └───────┬────────┘
                                              │
                                   Private application subnets
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                              ECS Fargate API      ECS Fargate API
                                    │                   │
                                    └─────────┬─────────┘
                                              │
                    ┌─────────────────────────┼────────────────────────┐
                    │                         │                        │
                    ▼                         ▼                        ▼
             RDS PostgreSQL             ElastiCache              MSK Serverless
               Multi-AZ                  Valkey                      Kafka
                                                                   │
                                                       visualize-jobs
                                                                   │
                                   ┌───────────────────────────────┴──────┐
                                   │                                      │
                                   ▼                                      ▼
                        Dedicated ECS/EC2                       Dedicated ECS/EC2
                         Python sandbox                           Go sandbox
                                   │                                      │
                                   └──────────────────┬───────────────────┘
                                                      │
                                              visualize-results
                                                      │
                                                      ▼
                                                   Kafka

```