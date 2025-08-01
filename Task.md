What i want: the + (add button) button only adds sections and only inside a section you can add blocks with the updated block chooser. now the problem is that the section with a slate looks like this:
__________________________________________---_
|________________________________________|xxx||
|                 slate                   --- |
|----------------------------------------------
-----------------------------------------------
where the x are the slate's icons

so when i open the add block modal it looks like this:

_______________________________________________________________________________
|___________________________________|     |                                    |
|                 slate             |     |                                    |
|-----------------------------------|     |                                    |
------------------------------------|     |                                    |
                                    |     |                                    |
                                    |     |                                    |
                                    |     |                                    |
                                    |  x  |         compact block chooser      |
                                    |  x  |                                    |
                                    |  x  |                                    |
                                    |     |                                    |
                                    |     |                                    |
                                    |     |                                    |
                                    |     |                                    |
                                    |     |                                    |
                                    --------------------------------------------

but in reality it looks more awkward because its pushed too much to the right

so i think we should change things a bit to make it look more friendly with the user
when a section is added, instead of a slate being added automatically, i need this:

__________________________________________________----____
| ------------                                   |x x|    |  
|| add block  |                                           |  
| ------------                                            |
|                                                         |
|                                                         |
|                                                         |
|                                                         |
|                                                         |
|                                                         |
|                                                         |
-----------------------------------------------------------

where the x's are the other icons, drag and delete