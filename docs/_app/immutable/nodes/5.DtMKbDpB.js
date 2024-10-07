import{s as l,n as r,o as h}from"../chunks/scheduler.DMpL1rC9.js";import{S as d,i as c,e as u,H as p,c as m,a as f,p as k,d as s,l as b,g as y,q as g,r as x,u as w,v,w as _,x as D}from"../chunks/index.-cgp4Yhl.js";import{m as C}from"../chunks/marked.esm.D23x4JZT.js";function S(i){let t,n;return{c(){t=u("div"),n=new p(!1),this.h()},l(e){t=m(e,"DIV",{class:!0});var a=f(t);n=k(a,!1),a.forEach(s),this.h()},h(){n.a=null,b(t,"class","w-100 stats")},m(e,a){y(e,t,a),n.m(i[0],t)},p(e,[a]){a&1&&n.p(e[0])},i:r,o:r,d(e){e&&s(t)}}}function L(i){return i.split(`
`).map(e=>e.trimStart()).join(`
`)}function $(){document.querySelectorAll('input[type="checkbox"]').forEach(n=>{n.disabled=!1}),document.querySelectorAll("ul, ol").forEach(n=>{n.querySelector('input[type="checkbox"]')&&n.classList.add("checkbox-list")})}function A(i,t,n){let{markdownContent:e=""}=t,a="";return h(()=>{const o=L(e);n(0,a=C(o)),requestAnimationFrame(()=>{$()})}),i.$$set=o=>{"markdownContent"in o&&n(1,e=o.markdownContent)},[a,e]}class I extends d{constructor(t){super(),c(this,t,A,S,l,{markdownContent:1})}}function q(i){let t,n;return t=new I({props:{markdownContent:i[0]}}),{c(){g(t.$$.fragment)},l(e){x(t.$$.fragment,e)},m(e,a){w(t,e,a),n=!0},p:r,i(e){n||(v(t.$$.fragment,e),n=!0)},o(e){_(t.$$.fragment,e),n=!1},d(e){D(t,e)}}}function H(i){return[`
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
* UA Into the Wild <a href='pdfs/UA_IntoTheWild.pdf' target='_blank'>[Guide]</a>

    `]}class W extends d{constructor(t){super(),c(this,t,H,q,l,{})}}export{W as component};
