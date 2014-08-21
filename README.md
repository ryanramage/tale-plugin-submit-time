
Add the following to your template

```
      {{^submitted}}
        {{#network_available}}
        <button class="btn btn-primary" on-click="submit_time">Submit Time &raquo;</button>
        {{/network_available}}
        {{^network_available}}
          <p>Connect to the internet to submit your results.</p>
        {{/network_available}}
        {{#time_err}}
          <b>Failed to submit</b>
        {{/time_err}}
      {{/submitted}}
      {{#submitted}}
        {{#time.end}}
          <p>
             Finished: {{time.end_pretty}}<br>
             Duration: {{time.pretty}} (hh:mm:ss)
          </p>
        {{/time.end}}
        {{^time.user_id}}
          <p>Anonymously submitted. Login to claim your time</p>
          <a class="btn btn-primary" href="./{{chapter.id}}/login">Login &raquo;</a>
        {{/time.user_id}}
        {{#time.user_id}}
          {{#chapter.end_link}}
              <button class="btn btn-primary" on-click="end_link">Next &raquo;</button>
          {{/chapter.end_link}}
        {{/time.user_id}}
      {{/submitted}}

```