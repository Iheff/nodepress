nodepress
=========

node.js - a quick example of feeding a node site with worpress blog, offers a lot of speed advantage of a generic wp site, the JSON API wp plugin is required, but you can get it free, and also add to it easily, this is a vanilla base for you to start you build with, It wtill needs some functions pulling out into modules - but hey fork it and do it yourself! - I thought this might help anyone to a shortcut into the process, I am at the point where I need to hack the JSON API a bit now to pull custom stuff, so I can grab widget etc I wanted to leave this as a out of thebox solution so wont be including any of my customisations, I may develop this further into modules etc

You should have permailink set to %postname%, I will be working on adding adding category based url support.

/ index
/p/# index page #
/:category/ categogory indexes
/:category/#/ category page #
/article/%postname%  article indexes
/page/%postname% pages