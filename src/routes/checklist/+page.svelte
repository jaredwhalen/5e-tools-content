<script>
	import Markdown from '$lib/Markdown.svelte';

	const markdownContent = `
# Session Checklist
The following are actions that should be taken by the DM and players at set points throughout the session.

## Session Start
* [ ] Introduce setting for new players
* [ ] Resolve Downtime activities
* [ ] Resolve calendar events
* [ ] Handle shopping
* [ ] Handle inventory management

## Start of day (travel)
<ul>
  <li><input type="checkbox"> Check weather <a href='https://donjon.bin.sh/d20/weather/' target='_blank'>[Generator]</a></li>
  <li><input type="checkbox"> Determine travel pace</li>
  <li><input type="checkbox"> Choose travel activities</li>
   <ul>
      <li><input type="checkbox"> Navigate</li>
      <li><input type="checkbox"> Look for tracks
        <ul class='note-list'>
            <li>Survival or Investigation</li>
            <li>Looks for any tracks or track specific creature</li>
        </ul>
      </li>
      <li><input type="checkbox"> Forage
       <ul class='note-list'>
        <li>
              <table>
            <thead>
                <tr>
                <th>Food and Water Availability</th>
                <th>DC</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Abundant food and water sources</td>
                    <td>10</td>
                </tr>
                <tr>
                    <td>Limited food and water sources</td>
                    <td>15</td>
                </tr>
                 <tr>
                    <td>Very little, if any, food and water sources</td>
                    <td>20</td>
                </tr>
               
            </tbody>
            </table>
        </li>
        </ul>
        </table>
        </li>
      <li><input type="checkbox"> Draw a map</li>
      <li><input type="checkbox"> Scout
        <ul class='note-list'>
            <li>Stealth, Survival, or Perception</li>
        </ul>
      </li>
    </ul>
  <li><input type="checkbox"> Role navigation check
    <ul class='note-list'>
        <li>
        <table>
            <thead>
                <tr>
                <th>DC</th>
                <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>None</td>
                <td>Destination has a clear road, trail, or well-marked path leading to it</td>
                </tr>
                <tr>
                <td>10</td>
                <td>Destination lacks a path but is in open terrain</td>
                </tr>
                <tr>
                <td>15</td>
                <td>Destination lacks a path but is in dense terrain such as forest or mountains</td>
                </tr>
                <tr>
                <td>20</td>
                <td>Destination is hidden, with active efforts made to conceal its existence through mundane means</td>
                </tr>
                <tr>
                <td>25</td>
                <td>Destination is hidden using illusions or other magic</td>
                </tr>
                <tr>
                <td>30</td>
                <td>Destination is hidden using powerful magic, such as a regional effect that causes a forest's trees to slowly shift and force characters onto the wrong path</td>
                </tr>
            </tbody>
        </table>
    </li>
    <li>
        If failed, use the difference between the role and the DC to determine how lost the party is.

        <table>
            <thead>
                <tr>
                <th>#</th>
                <th>Result</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1-4</td>
                    <td>1 hex away from destination</td>
                </tr>
                <tr>
                    <td>5-9</td>
                    <td>1 hex off course along route</td>
                </tr>
                 <tr>
                    <td>10+</td>
                    <td>After traveling in circles, end 1 hex from starting point</td>
                </tr>
               
            </tbody>
        </table>
    </li>

    </ul>  
  </li>
    <li><input type="checkbox"> Draw route on hex map</li>

    <li><input type="checkbox"> Roll 6d6 Danger dice and set travel encounters
    <ul>
      <li><input type="checkbox"> Morning</li>
      <li><input type="checkbox"> Afternoon</li>
      <li><input type="checkbox"> Evening</li>
      <li><input type="checkbox"> Dusk</li>
      <li><input type="checkbox"> Midnight (1st shift)</li>
      <li><input type="checkbox"> Predawn (2nd shift)</li>
    </ul>
  </li>
</ul>


## End of day
* [ ] Log progress and resolve Lost status
* [ ] Resolve rations

## Links
* Harvesting <a href='pdfs/harvesting.pdf' target='_blank'>[Guide]</a>

    `;
</script>

<Markdown {markdownContent} />
