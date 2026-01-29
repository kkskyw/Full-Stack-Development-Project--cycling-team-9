# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListEvents*](#listevents)
  - [*ListVolunteers*](#listvolunteers)
- [**Mutations**](#mutations)
  - [*CreateOrganization*](#createorganization)
  - [*SignupForEvent*](#signupforevent)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListEvents
You can execute the `ListEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listEvents(): QueryPromise<ListEventsData, undefined>;

interface ListEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
}
export const listEventsRef: ListEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEvents(dc: DataConnect): QueryPromise<ListEventsData, undefined>;

interface ListEventsRef {
  ...
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
}
export const listEventsRef: ListEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEventsRef:
```typescript
const name = listEventsRef.operationName;
console.log(name);
```

### Variables
The `ListEvents` query has no variables.
### Return Type
Recall that executing the `ListEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListEventsData {
  events: ({
    id: UUIDString;
    title: string;
    date: DateString;
    time: string;
    location: string;
    description: string;
  } & Event_Key)[];
}
```
### Using `ListEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEvents } from '@dataconnect/generated';


// Call the `listEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEvents(dataConnect);

console.log(data.events);

// Or, you can use the `Promise` API.
listEvents().then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `ListEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEventsRef } from '@dataconnect/generated';


// Call the `listEventsRef()` function to get a reference to the query.
const ref = listEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## ListVolunteers
You can execute the `ListVolunteers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listVolunteers(): QueryPromise<ListVolunteersData, undefined>;

interface ListVolunteersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVolunteersData, undefined>;
}
export const listVolunteersRef: ListVolunteersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVolunteers(dc: DataConnect): QueryPromise<ListVolunteersData, undefined>;

interface ListVolunteersRef {
  ...
  (dc: DataConnect): QueryRef<ListVolunteersData, undefined>;
}
export const listVolunteersRef: ListVolunteersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVolunteersRef:
```typescript
const name = listVolunteersRef.operationName;
console.log(name);
```

### Variables
The `ListVolunteers` query has no variables.
### Return Type
Recall that executing the `ListVolunteers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVolunteersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVolunteersData {
  volunteers: ({
    id: UUIDString;
    displayName: string;
    email: string;
    phoneNumber?: string | null;
    skills?: string[] | null;
  } & Volunteer_Key)[];
}
```
### Using `ListVolunteers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVolunteers } from '@dataconnect/generated';


// Call the `listVolunteers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVolunteers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVolunteers(dataConnect);

console.log(data.volunteers);

// Or, you can use the `Promise` API.
listVolunteers().then((response) => {
  const data = response.data;
  console.log(data.volunteers);
});
```

### Using `ListVolunteers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVolunteersRef } from '@dataconnect/generated';


// Call the `listVolunteersRef()` function to get a reference to the query.
const ref = listVolunteersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVolunteersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.volunteers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.volunteers);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateOrganization
You can execute the `CreateOrganization` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createOrganization(vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;

interface CreateOrganizationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
}
export const createOrganizationRef: CreateOrganizationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrganization(dc: DataConnect, vars: CreateOrganizationVariables): MutationPromise<CreateOrganizationData, CreateOrganizationVariables>;

interface CreateOrganizationRef {
  ...
  (dc: DataConnect, vars: CreateOrganizationVariables): MutationRef<CreateOrganizationData, CreateOrganizationVariables>;
}
export const createOrganizationRef: CreateOrganizationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrganizationRef:
```typescript
const name = createOrganizationRef.operationName;
console.log(name);
```

### Variables
The `CreateOrganization` mutation requires an argument of type `CreateOrganizationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateOrganizationVariables {
  name: string;
  email: string;
}
```
### Return Type
Recall that executing the `CreateOrganization` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrganizationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrganizationData {
  organization_insert: Organization_Key;
}
```
### Using `CreateOrganization`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrganization, CreateOrganizationVariables } from '@dataconnect/generated';

// The `CreateOrganization` mutation requires an argument of type `CreateOrganizationVariables`:
const createOrganizationVars: CreateOrganizationVariables = {
  name: ..., 
  email: ..., 
};

// Call the `createOrganization()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrganization(createOrganizationVars);
// Variables can be defined inline as well.
const { data } = await createOrganization({ name: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrganization(dataConnect, createOrganizationVars);

console.log(data.organization_insert);

// Or, you can use the `Promise` API.
createOrganization(createOrganizationVars).then((response) => {
  const data = response.data;
  console.log(data.organization_insert);
});
```

### Using `CreateOrganization`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrganizationRef, CreateOrganizationVariables } from '@dataconnect/generated';

// The `CreateOrganization` mutation requires an argument of type `CreateOrganizationVariables`:
const createOrganizationVars: CreateOrganizationVariables = {
  name: ..., 
  email: ..., 
};

// Call the `createOrganizationRef()` function to get a reference to the mutation.
const ref = createOrganizationRef(createOrganizationVars);
// Variables can be defined inline as well.
const ref = createOrganizationRef({ name: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrganizationRef(dataConnect, createOrganizationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.organization_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.organization_insert);
});
```

## SignupForEvent
You can execute the `SignupForEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
signupForEvent(vars: SignupForEventVariables): MutationPromise<SignupForEventData, SignupForEventVariables>;

interface SignupForEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SignupForEventVariables): MutationRef<SignupForEventData, SignupForEventVariables>;
}
export const signupForEventRef: SignupForEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
signupForEvent(dc: DataConnect, vars: SignupForEventVariables): MutationPromise<SignupForEventData, SignupForEventVariables>;

interface SignupForEventRef {
  ...
  (dc: DataConnect, vars: SignupForEventVariables): MutationRef<SignupForEventData, SignupForEventVariables>;
}
export const signupForEventRef: SignupForEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the signupForEventRef:
```typescript
const name = signupForEventRef.operationName;
console.log(name);
```

### Variables
The `SignupForEvent` mutation requires an argument of type `SignupForEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SignupForEventVariables {
  volunteerId: UUIDString;
  eventId: UUIDString;
}
```
### Return Type
Recall that executing the `SignupForEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SignupForEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SignupForEventData {
  eventSignup_insert: EventSignup_Key;
}
```
### Using `SignupForEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, signupForEvent, SignupForEventVariables } from '@dataconnect/generated';

// The `SignupForEvent` mutation requires an argument of type `SignupForEventVariables`:
const signupForEventVars: SignupForEventVariables = {
  volunteerId: ..., 
  eventId: ..., 
};

// Call the `signupForEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await signupForEvent(signupForEventVars);
// Variables can be defined inline as well.
const { data } = await signupForEvent({ volunteerId: ..., eventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await signupForEvent(dataConnect, signupForEventVars);

console.log(data.eventSignup_insert);

// Or, you can use the `Promise` API.
signupForEvent(signupForEventVars).then((response) => {
  const data = response.data;
  console.log(data.eventSignup_insert);
});
```

### Using `SignupForEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, signupForEventRef, SignupForEventVariables } from '@dataconnect/generated';

// The `SignupForEvent` mutation requires an argument of type `SignupForEventVariables`:
const signupForEventVars: SignupForEventVariables = {
  volunteerId: ..., 
  eventId: ..., 
};

// Call the `signupForEventRef()` function to get a reference to the mutation.
const ref = signupForEventRef(signupForEventVars);
// Variables can be defined inline as well.
const ref = signupForEventRef({ volunteerId: ..., eventId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = signupForEventRef(dataConnect, signupForEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.eventSignup_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.eventSignup_insert);
});
```

