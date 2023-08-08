import strHtml from "../../main";
import runTests, {
  addTest,
  assertEqual,
  assertThrows,
} from "../lib";

addTest("should allow simple element creation", () => {
  const div1 = strHtml`<div/>`;
  assertEqual(div1.outerHTML, "<div></div>");

  const div2 = strHtml`<div />`;
  assertEqual(div2.outerHTML, "<div></div>");

  const div9 = strHtml`<div9/>`;
  assertEqual(div9.outerHTML, "<div9></div9>");

  const d_i = strHtml`<d_iv:9/>`;
  assertEqual(d_i.outerHTML, "<d_iv:9></d_iv:9>");

  const div3 = strHtml`<div></div>`;
  assertEqual(div3.outerHTML, "<div></div>");
});

addTest("should parse text attributes", () => {
  const div1 = strHtml`<div attr="a b " class=toto disabled />`;
  assertEqual(
    div1.outerHTML,
    '<div attr="a b " class="toto" disabled=""></div>'
  );

  const div2 = strHtml`<div attr=${"a \" & "}${"<b "} class=toto disabled />`;
  assertEqual(
    div2.outerHTML,
    '<div attr="a &quot; &amp; <b " class="toto" disabled=""></div>'
  );
});

addTest("should allow leading white space", () => {
  const div1 = strHtml`     <div/>`;
  assertEqual(div1.outerHTML, "<div></div>");
  const div2 = strHtml`
    <div/>`;
  assertEqual(div2.outerHTML, "<div></div>");
  const div3 = strHtml`   
<div/>`;
  assertEqual(div3.outerHTML, "<div></div>");
  const div4 = strHtml`
    <div/>`;
  assertEqual(div4.outerHTML, "<div></div>");
});

addTest("should allow whitespace between attributes", () => {
  const div1 = strHtml`     <div     />`;
  assertEqual(div1.outerHTML, "<div></div>");
  const div2 = strHtml`<div   
       attr      attr2="test"       attr3 =      ${"aa"}ttt/>`;
  assertEqual(
    div2.outerHTML,
    `<div attr="" attr2="test" attr3="aattt"></div>`
  );
  const div3 = strHtml`<div   
       attr      attr2="test"       attr3 =      :${"aa"}ttt/> `;
  assertEqual(
    div3.outerHTML,
    `<div attr="" attr2="test" attr3=":aattt"></div>`
  );
});

addTest("should throw at invalid element name", () => {
  assertThrows(() => strHtml`<9div/>`);
  assertThrows(() => strHtml`<d!iv/>`);
});

addTest("should throw at empty string", () => {
  assertThrows(() => strHtml``);
});

addTest("should throw at empty element name", () => {
  assertThrows(() => strHtml`<></>`);
  assertThrows(() => strHtml`</>`);
  assertThrows(() => strHtml`< />`);
  assertThrows(() => strHtml`< class="test" />`);
});

addTest("should throw at unterminated element name", () => {
  assertThrows(() => strHtml`<div/`);
  assertThrows(() => strHtml`<div`);
  assertThrows(() => strHtml`<`);
});

addTest("should throw if opening and closing tag don't match", () => {
  assertThrows(() => strHtml`<ping></pong>`);
  assertThrows(() => strHtml`<ping></ pong>`);
});

addTest("should conserve whitespace in an element's content", () => {
  const div1 = strHtml`<div>

    444444
      </div>`;
  assertEqual(div1.outerHTML, `<div>

    444444
      </div>`);
});

addTest("should allow complex content", () => {
  const div1 = strHtml`     <div attr="val ${"val 2"} val3" >
    <div  bip="bop ${"bop 2"} bop3" />
    ${strHtml`<blap  boom="dwq ${"dwq 2"} dwq3" >
        content ${"other content"} ${strHtml`<div/>`} 45 </blap>`}

    <span  bip="bop ${"bop 2"} bop3">
      ${strHtml`<blap  boom="dwq ${["dwq 2", 555, true]} dwq3" >
          ${strHtml`<pre>${["content", strHtml`<div/>`]}</pre>`}</blap>`}
    </span>
  </div>`;
  assertEqual(
    div1.outerHTML,
    `<div attr="val val 2 val3">
    <div bip="bop bop 2 bop3"></div>
    <blap boom="dwq dwq 2 dwq3">
        content other content <div></div> 45 </blap>

    <span bip="bop bop 2 bop3">
      <blap boom="dwq dwq 2555true dwq3">
          <pre>content<div></div></pre></blap>
    </span>
  </div>`);
});

addTest("should allow unclosed void elements", () => {
  const div1 = strHtml`     <div attr="val ${"val 2"} val3" >
    <area />
    <div  bip="bop ${"bop 2"} bop3" />
    <input>
    ${strHtml`<blap  boom="dwq ${"dwq 2"} dwq3" >
        content <br> ${"other content"}</br> ${strHtml`<div/>`} 45 </blap>`}

    <span  bip="bop ${"bop 2"} bop3">
      ${strHtml`<blap  boom="dwq ${["dwq 2", 555, true]} dwq3" >
          ${strHtml`<pre>${["content", strHtml`<div/>`]}</pre>`}</blap>`}
    </span>
  </div>`;
  assertEqual(
    div1.outerHTML,
    `<div attr="val val 2 val3">
    <area>
    <div bip="bop bop 2 bop3"></div>
    <input>
    <blap boom="dwq dwq 2 dwq3">
        content <br> other content <div></div> 45 </blap>

    <span bip="bop bop 2 bop3">
      <blap boom="dwq dwq 2555true dwq3">
          <pre>content<div></div></pre></blap>
    </span>
  </div>`);
});

addTest("should (silently) authorize forgetting to close the parent element", () => {
  const div1 = strHtml`<div>`;
  assertEqual(div1.outerHTML, "<div></div>");

  const div2 = strHtml`<div >someContent${555}`;
  assertEqual(div2.outerHTML, "<div>someContent555</div>");

  const div3 = strHtml`<div><span>   </span>5555 lala`;
  assertEqual(div3.outerHTML, "<div><span>   </span>5555 lala</div>");

  const div4 = strHtml`<div><span>   </span>5555 ${"tes"}`;
  assertEqual(div4.outerHTML, "<div><span>   </span>5555 tes</div>");

  const div5 = strHtml`<div><span>   </span>5555 ${strHtml`<div>`}`;
  assertEqual(div5.outerHTML, "<div><span>   </span>5555 <div></div></div>");
});

runTests();
