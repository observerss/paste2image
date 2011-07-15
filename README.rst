===========
Paste2Image
===========
:Info: Paste2Image is webapp which can convert text to image.
:Author: scv2duke (http://github.com/observerss)
:License: Paste2Image is licensed under the Apache License, Verion 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html).

About
=====
- Paste2Image is webapp which can convert text to image.
- Paste2Image is based on Tornado.web + MongoEngine + MongoDB
- This can be a very simple demonstration of how these tools can work together.
- There's no documentation except the source code itself.

Installation
============
Make sure you have the following packages installed

- sudo apt-get install python-setuptools python-imaging
- sudo easy_install -U mongoengine tornado pygments

Install Mongodb

- Ubuntu/Debian( http://www.mongodb.org/display/DOCS/Ubuntu+and+Debian+packages )
- Centos/Fedora( http://www.mongodb.org/display/DOCS/CentOS+and+Fedora+Packages )

Then clone this repository and run 

- git clone git://github.com/observerss/paste2image.git
- python paste2image.py --port=8888

visit http://localhost:8888 for test

Dependencies
============
- tornado.web tested with 2.0
- mongoengine tested with 0.4
- mongodb tested with 1.8.2
- pygments tested with 1.4

Deployment
==========
- Please refer to tornado.web's doc for deployment

Community
=========
- There is no Community about this

Contributing
============
The source is available on `GitHub <http://github.com/observerss/paste2image>`_ - to
contribute to the project, fork it on GitHub and send a pull request, all
contributions and suggestions are welcome!

