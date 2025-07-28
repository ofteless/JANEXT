# JANEXT

Just `git clone` this, go to the extensions screen of your favorite Chromium browser, press "Load Unpacked" 
and select the folder containing these files. 

## Usage

Click on the extension in the extensions menu, change your stuff, click save, bingo bango, all outgoing requests to openrouter from janitorai
should be affected with your new parameters. Note max token and temperatures in the extension will override that of your settings on janitorai, and
that if you do not enter anything in the extension, the `placeholder` value will be passed (the value the slider had before changing it). Don't worry,
all of the placeholders are set so the samplers are disabled by default. 