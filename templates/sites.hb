<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}

      <div class="table-responsive">
            <table class="table table-hover table-condensed table-striped table-bordered" id="sitesTable">
              <thead>
                <tr>
                  <th data-sort="string">
                      <a rel="tooltip"  data-placement="top" data-html="false" href="#" data-original-title="The start URL of the site that has been tested">site</a>
                  </th>
                  {{#each columns}}
                  <th data-sort="float">
                    <a rel="tooltip"  data-placement="top" data-html="false" href="#" data-original-title="{{getColumnsMeta this ../columnsMeta ../ruleDictionary 'desc'}}">
                      {{getColumnsMeta this ../columnsMeta ../ruleDictionary 'title'}}
                    </a>
                  </th>
                  {{/each}}
                </tr>
              </thead>
              <tbody>
                {{#each sitesAndAggregates}}
              <tr>
                <td>
                  {{#if config.url}}
                    <a href="{{getHostname this.site}}/index.html">{{this.site}}</a>
                  {{else}}
                  <a href="{{this.site}}/index.html">{{this.site}}</a>
                {{/if}}
                </td>
                {{#each aggregates}}
                  <td data-sort-value="{{#if stats.median}}{{stats.median}}{{else}}-1{{/if}}">{{getHumanReadable this stats.median true}}</td>
                {{/each}}
              </tr>
              {{/each}}
              </tbody>
            </table>
      </div>


  </div>
</div>
  {{> footer}}

<script>
$(function(){
  $("#sitesTable").stupidtable();
  });
</script>

<script>
$(function () {
$('.container').tooltip({
  selector: "a[rel=tooltip]"
  })
})
</script>
</body>
</html>
