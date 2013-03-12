Release notes
-------------
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
