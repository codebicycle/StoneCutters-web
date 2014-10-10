#!/bin/bash

# install dependencies
npm install

# execute grunt job
grunt prepipeline --reporter=spec
