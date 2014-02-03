Release notes
-------------
##### v1.1.8 (2014-02-03)
Bugfix release  
`-` isMasked is ignored if showToggle is on  
`+` API to set minimum and maximum length: `length` property  

-------------
##### v1.1.7 (2013-08-30)
New Bootstrap version support  
`-` #14: Bootstrap 3.0 support  

-------------
##### v1.1.6 (2013-07-14)
Bugfix release  
`-` #13: JQuery validation extension does not work correctly  

##### v1.1.5 (2013-06-30)
Dircectories restructured  
`*` directories changed; please note: images are now in `img` dir  
`-` #12: backspace or delete doesn't invalidate password  

##### v1.1.4 (2013-04-26)
New locale  
`+` #11: added pt locale (thanks to gimoteco)  
##### v1.1.3 (2013-03-24)
Small new features  
`+` events option introduced; `generated` and `switched` events are now triggered  
`+` option to compare password with login (`nonMatchField` parameter)  
`+` passwords like 111111 will be considered weak  

##### v1.1.2 (2013-03-18)
Some improvements  
`+` #6: now most letters from european alphabets are treated as letters  
`+` bootstrap popovers are now the same width as input  
`-` popovers behavior fixed in old browsers  

##### v1.1.1 (2013-03-13)
Small stability improvement  
`+` more smooth and reliable password visibility toggle mechanism

##### v1.1.0 (2013-03-12)
New features; stability and UX improvements  
`+` #7: added `getPassStrength` method for more flexible result check availability  
`+` #5: all non-satisfied rules will be shown in the tip after strength validation  
`+` #10: option to use bootstrap popovers (`tipPopoverStyle` property)  
`+` text selection is now preserved after display mode switch  
`*` #4: password strength estimation algorithm made smarter; `checkMode` parameter introduced  
`-` #3: fixed a bug when buttons were still visible even with long password  
`-` #2: fixed wrong behavior when LastPass plugin is installed

##### v1.0.2 (2013-03-05)
Minor bugfix release  
`-` #9: fixed jQuery dependency issue  

##### v1.0.1 (2013-03-04)
Stability improvements; minor feature requests  
`+` the password will be masked back if the field is out of focus for some time  
`+` not only latin letters will be treated as letters by default, hovewer latin ones will be generated  
`*` less strict default password pattern  
`-` positioning issue fixed  
`-` size and class attributes now will be copied also  

##### v1.0.0 (2013-03-02)
Initial commit
