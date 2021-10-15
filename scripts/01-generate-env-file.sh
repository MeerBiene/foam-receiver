#!/bin/bash
sed s/YOUR_TOKEN/$(openssl rand -hex 16)/ example.env > test.env