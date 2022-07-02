# WebApp-Simple-Framework

## Usage

### Create new application

To create a new application based on this framework, proceed as follow:
- Create an empty directory or git repository.
- Copy the framework into the subdirectory framework/ (or include it as a git submodule).
- Copy the file example/package.json
- Adapt the file to your needs: change name, author, license, homepage...
- Install Node modules with: npm install
- Run: npm run bootstrap

### Develop

You can then use the following commands during development:
- npm run build: Build the application.
- npm run deploy: Build and deploy the application into the _dist directory.
- npm run deploy-dirty: Build and deploy without cleaning first (faster than deploy).
- npm run start: Start the deployed application.
- npm run doc: Generate code documentation
- npm run clean: Remove generated files.
- npm run dist-clean: Remove generated files and Node modules.

### Deploy

To deploy to a server:
- Build and deploy the application with: npm run deploy
- Copy the _dist directory to your server
- Adapt the configuration
- Create a systemd service (use example.service as an example).
- Start the service

## License

&copy; 2022 Fabien Pollet <polletfa@posteo.de>

WebApp-Simple-Framework is licensed under the MIT license. See the [LICENSE file](https://github.com/polletfa/WebApp-Simple-Framework/blob/develop/LICENSE.md) for details.

