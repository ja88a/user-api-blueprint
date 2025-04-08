# Project Development Roadmap

## Purpose

The objective of this high-level software development roadmap is to iteratively reach a production grade level for micro-services developed in this repository.

## Topics & Features

### Development framework

- Mono-repository approach for grouping the development & management of potentially many micro-services - **DONE**
- Implement basic CRUD operations for managing user & sub-accounts data - **DONE**
- Modularity - **DONE**
  - business domain driven isolation of web services' functional scope
  - each web services embeds its API controllers, services, data models & persistence layer (Postgres DB via Drizzle ORM)
  - reuse across web services of developed utility libraries, config and data models via package dependencies
  - reuse of owned or external modules via import & injection: controllers, services & data connectors
- OpenAPI specification support: Swagger web doc & API Client generation
- Tests - **Partially DONE**
  - database mocking - **DONE**
  - unit tests framework + samples - **DONE**
  - integration tests - **DONE**
  - end-to-end tests from the API Client - **DONE**
  - workload tests to audit & optimize
- Multiple environments integration: local & remote development, staging & prod platforms - **DONE**
- Functional improvements
  - pagination support for returned results

### Security Hardening

- Development of or integration with a user authentication / authorization service
  - Simple in-house credentials based authentication
  - OpenID connector to a 3rd party, e.g. Google SSO, FusionAuth
  - SIWE protocol integration for wallet signature-based authentication of users
  - Integration of a blockchain-based DID solution
- Protect the users management API endpoints
  - Enable actual API Auth Bearer support based on JWT Authorization header - **Partially DONE**
  - Requests input validation: strong typing and constrained value support (length, pattern, etc) - **DONE**
  - Sanitization of input values
  - CSRF protection to protect the forgery of client submitted data
- Multi-tenancy support
  - API Key and tenant ID handling
  - Develop or integrate with a web service handling customer or product-related tenant support
- User Roles management and permissions, with multi-tenancy support
- Encryption of the sensitive user data at rest, in the database
- Outputs validation, pruning and/or obfuscation of sensitive data in responses - **DONE**

### Databases management

- Init & config - **DONE**
- Automation: init, start, stop & reset scripts - **DONE**
- Generate & migrate DB schema - **DONE**
- VPN-based access to remote databases & tools integration - **DONE**

### Data caching

- Integrate a distributed remote data caching solution, e.g. Redis
- Optimize: DB reads, service & controller processed data sets

### Docker integration

- Docker image build using multi-staging - **DONE**
  - docker-compose setup & integration
  - kube setup?
- Integration of this micro-service by other web services, with an alternative to http REST API calls
  - consider adding gRPC controller & client for the latter to be integrated by other web services
  - EDA architecture: consider the integration of an event broker, e.g. Kafka, or of a message queuing solution, e.g. RabbitMQ

### Documentation

- OpenAPI specs & swagger UI - **DONE**
- framework setup - **DONE**
  - configs
  - install, build & run the server
  - how to setup & run tests locally
  - Git branches & PR management
- deployments, CI/CD & infra integrations, databases management, security measures - **Partially DONE**

### Releases management

- Resources versioning - **Partially DONE**
  - URI-based versioning & API Gateway integration
  - package versions
  - git tagging
  - changelogs generation from commit history
  - docker images
- Release management
  - release process documentation
  - automated scripts/actions

### DevOps CI/CD Automation

- IaC: Terraform or Pulumi management of the infra setup & ops, networking, security & components
- Init & develop CI flows: build, validation & tests
- Init & develop CD flows
  - docker image builds & registry integration
  - containers deployment

### High Availability & Monitoring

- Initiate development, staging & production: accounts and environments
- Document necessary runtime env config & secrets management/integration
- Deployment type: ECS vs. EKS vs. lambdas / serverless functions?
- Network infra, DDoS protection
- Strategy for new service deployments, e.g. blue/green & canary techniques
- High-availability
  - platforms & pods integration
  - fine tuning of auto scaling policies
- Monitoring & errors management
  - web services' health check, restarts & alerts
  - errors management & standard http errors
  - runtime logs integration
    - logger integration, pretty-print & JSON formatted log streams
    - trace/correlation ID support: per session or for each request
    - HTTP request & response default logging with reactive log levels
  - trace/correlation ID integration of client session and/or at request level
  - reporting of runtime containers & internal service metrics, e.g. Prometheus
  - observability & alerts triggering, e.g. Kibana, Grafana, CloudWatch, Datadog
