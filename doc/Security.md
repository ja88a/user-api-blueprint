# TUBA Backend Doc - Security

## CORS

Cross-origin resource sharing (CORS) is a security feature that restricts what resources a web page can request from another domain.

It is always enabled and configured to allow only whitelisted clients / frontend web application to access the backend web services.

Reference integration is available in [`packages/common/lib-utils-ws/src/api-configurator.ts`](../packages/common/lib-utils-ws/src/api-configurator.ts):

```typescript
// Enable CORS for all requests
app.enableCors({
  origin: whitelistedUrls,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
})
```

CORS whitelisted URLs can be found in the [WS APIs common configuration](../packages/common/lib-utils-ws/src/api-configurator.ts):

```typescript
  /^https?:\/\/localhost(:\d+)?$/,  // local
  /\.dev\.none\.com$/,           // dev
  /\.stg\.none\.com$/,          // staging
  /\.api\.none\.com$/,       // prod
```

Reference documentations:

- [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), MDN web docs

## Users Authentication

**MISSING**: No user authentication is actually implemented

_TO BE IMPLEMENTED_

## Misc measures

### Inputs Validation

All inputs are validated to prevent injection attacks.

The data object are constrained at their structure, fields composition, and field values: their type and format, length, etc.

This is done by using the [`class-validator`](https://github.com/typestack/class-validator#readme) library, which is integrated in the NestJS framework. All DTO objects & their fields must implement the validation decorators.

Sample DTO:

```typescript
export class SignInEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 10,
    maxLength: 64,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string
}
```

If the validation fails, the request is rejected with a `400` Bad Request HTTP status code.

### HTTP Security Headers

HTTP security headers are set to prevent common web vulnerabilities.

The [Helmet.js](https://helmetjs.github.io/) solution is integrated in the NestJS framework to set the following headers:

- `Content-Security-Policy`: A powerful allow-list of what can happen on your page which mitigates many attacks
- `Cross-Origin-Opener-Policy`: Helps process-isolate your page
- `Cross-Origin-Resource-Policy`: Blocks others from loading your resources cross-origin
- `Origin-Agent-Cluster`: Changes process isolation to be origin-based
- `Referrer-Policy`: Controls the Referrer header
- `Strict-Transport-Security`: Tells browsers to prefer HTTPS
- `X-Content-Type-Options`: Avoids MIME sniffing
- `X-DNS-Prefetch-Control`: Controls DNS prefetching
- `X-Download-Options`: Forces downloads to be saved (Internet Explorer only)
- `X-Frame-Options`: Legacy header that mitigates click-jacking attacks
- `X-Permitted-Cross-Domain-Policies`: Controls cross-domain behavior for Adobe products, like Acrobat
- `X-Powered-By`: Info about the web server. Removed because it could be used in simple attacks
- `X-XSS-Protection`: Legacy header that tries to mitigate XSS attacks, but makes things worse, so Helmet disables it

This integration is done in the method `handleSecurity` of [`packages/common/lib-utils-ws/src/api-configurator.ts`](../packages/common/lib-utils-ws/src/api-configurator.ts).

### Payload Size Limit

The payload size is limited for all requests to prevent denial of service attacks. It is set at `100 KB` by default but can customized for specific API methods.

This integration is done in the method `handleSecurity` of [`packages/common/lib-utils-ws/src/api-configurator.ts`](../packages/common/lib-utils-ws/src/api-configurator.ts).

### [TODO] Cross-Site Request Forgery - CSRF

CSRF (Cross-Site Request Forgery) is an attack that impersonates a trusted user and sends a website unwanted commands.

This type of attack occurs when a malicious web site, email, blog, instant message, or program tricks an authenticated user's web browser into performing an unwanted action on a trusted site. If a target user is authenticated to the site, unprotected target sites cannot distinguish between legitimate authorized requests and forged authenticated requests.
