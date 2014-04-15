#!/bin/bash

# npm install because dependencies
npm install

# write config
echo '{"auth":"/var/lib/jenkins/.ssh/id_rsa"}' > ../conf.json
echo 'module.exports={deploy:{version:"1.1.'${BUILD_NUMBER}'",revision:"test1234"}};'> ../app/config/build.js

# replace proper domains > $ sed -i 's/old/new/g' file.ext
for platform in html4 html5 desktop
do
	for env in testing staging 
	do
		cp ../public/css/$platform/styles.css ../public/css/$platform/styles-$env.css
		sed -i "s/(\/images/(http:\/\/images-${env}.olx-st.com\/mobile-webapp\/images/g" ../public/css/$platform/styles-$env.css
		sed -i "s/(\/fonts/(http:\/\/static-${env}.olx-st.com\/mobile-webapp\/fonts/g" ../public/css/$platform/styles-$env.css
	done
	# production
	sed -i "s/(\/images/(http:\/\/images01.olx-st.com\/mobile-webapp\/images/g" ../public/css/$platform/styles.css
	sed -i "s/(\/fonts/(http:\/\/static01.olx-st.com\/mobile-webapp\/fonts/g" ../public/css/$platform/styles.css
done

# execute grunt job
grunt pipeline --artifactory-version=${BUILD_NUMBER}