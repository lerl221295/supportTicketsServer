# Software como servicio para la gestión de tickets de soporte (server)

Aplicación multitenant.

Este software se vale principalmente de las siguientes tecnologías:

- Webpack
- Node.js
- Express.js
- GraphQL
- Apollo
- Apollo Engine
- MongoDB


## Instalación

##### Pre-requisitos

- Node.js (Current or LTS)
- NPM
- MongoDB

##### Instrucciones

- Configurar las contantes ubicadas en el archivo `./server.js`.
    - GRAPHQL_PORT: Puerto que levantará el servidor
    - GRAPHQL_HOST: Host del servidor
- `npm install`
- `npm run start`: Levanta servidor
