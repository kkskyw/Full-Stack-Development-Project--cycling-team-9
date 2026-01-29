# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createOrganization, listEvents, signupForEvent, listVolunteers } from '@dataconnect/generated';


// Operation CreateOrganization:  For variables, look at type CreateOrganizationVars in ../index.d.ts
const { data } = await CreateOrganization(dataConnect, createOrganizationVars);

// Operation ListEvents: 
const { data } = await ListEvents(dataConnect);

// Operation SignupForEvent:  For variables, look at type SignupForEventVars in ../index.d.ts
const { data } = await SignupForEvent(dataConnect, signupForEventVars);

// Operation ListVolunteers: 
const { data } = await ListVolunteers(dataConnect);


```