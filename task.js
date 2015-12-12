"use latest";

const _ = require('underscore');
const hbs = require('handlebars');
const async = require('async');
const request = require('request');
const cheerio = require('cheerio');

module.exports = (ctx, req, res) => {
  if (ctx.data && ctx.data.okta) {
    console.log('https://raw.githubusercontent.com' + ctx.data.okta.replace('/blob', ''));
    return request.get('https://raw.githubusercontent.com' + ctx.data.okta.replace('/blob', ''), function(err, r, html) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html
        .replace(/\"resources/g, '"https://raw.githubusercontent.com/okta/UserDocs/master/SAML_Docs/resources')
        .replace(/\"images/g, '"https://raw.githubusercontent.com/okta/UserDocs/master/SAML_Docs/images'));
    });
  }

  const View = `
    <html>
      <head>
        <title>Third Party SAML Configuration</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
        <style>
        .modal.modal-wide .modal-dialog {
          width: 90%;
        }
        .modal-wide .modal-body {
          overflow-y: auto;
        }
        </style>
      </head>
      <body style="margin-top: 20px">
        <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <input id="filter" type="text" class="form-control" placeholder="Filter in {{total}} tutorials from Auth0, Azure AD, Okta, OneLogin...">
          </div>
        </div>
        <div class="row">
          {{#if err}}
          <p>{{message}}</p>
          {{else}}
          <div class="col-sm-12">
            <table class="table table-striped table-hover">
              <thead>
              <tr>
                <th>Source</th>
                <th>Application</th>
                <th>Actions</th>
              </tr>
              </thread>
              <tbody>
              {{#each links}}
                <tr>
                  <td>{{type}}</td>
                  <td>{{text}}</td>
                  <td><a href="{{url}}" target="_blank" class="link btn btn-primary btn-sm"><i class="fa fa-info-circle"></i></a></td>
                </tr>
              {{/each}}
              </tbody>
            </table>
          </div>
          {{/if}}
        </div>
        </div>
        <div class="modal fade" id="saml-modal" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-lg modal-wide" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Thid Party Application</h4>
              </div>
              <div class="modal-body"></div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </body>
      <script src="//ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.3.js"></script>
      <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
      <script>
      $(function() {
        $('a.link').click(function(e) {
          var link = $(this);
          var url = link.attr('href');
          if (url.indexOf('?okta=') === 0) {
            e.preventDefault();

            $(".modal-body").load(url + '&_=' + (new Date().getTime()), function() {
              $('#saml-modal').modal('show');
            });
          }
          return;

          $('#contents').attr('src', url);
        });

        $('#filter').keyup(function () {
          var filter = $('#filter').val();
          $('tbody tr').hide();
          $('tbody tr').filter(function () { return $(this).text().toLowerCase().indexOf(filter.toLowerCase()) >= 0; }).show();
        })
      });
      </script>
    </html>`;

  getLinks((err, links) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const template = hbs.compile(View);
    res.end(template({
      err: err,
      links: links,
      total: links.length
    }));
  });
};

//
const getLinks = (done) => {
  const links = [];
  async.waterfall([
    (callback) => {
      request(`https://auth0.com/docs/saml-apps`, (err, res, html) => {
        if (err) {
          return callback(err);
        }

        if (res.statusCode !== 200) {
          return callback(new Error('Unexpected status code: ' + res.statusCode));
        }

        var $ = cheerio.load(html);
        $('section.docs-content h2').each((i, element) => {
          var header = $(element);
          links.push({
            text: header.text(),
            type: 'Auth0',
            url: 'https://auth0.com/docs/saml-apps' + header.find('span').attr('href')
          });
        });

        callback();
      });
    },
    (callback) => {
      const thirdParty = [{"id":"salesforce","name":"Salesforce","img_class":"salesforce","data_logo":"Salesforce","configRoute":"/add-ons/salesforce","callback":"https://login.salesforce.com"},{"id":"dropbox","name":"Dropbox","img_class":"dropbox","data_logo":"Dropbox","configRoute":"/add-ons/dropbox","callback":"https://www.dropbox.com/saml_login"},{"id":"sharepoint","name":"SharePoint","img_class":"microsoft-sharepoint-logo","data_logo":"Sharepoint","configRoute":"/add-ons/sharepoint"},{"id":"rms","name":"AD RMS","img_class":"windows-logo","data_logo":"Windows Server Active Directory RMS","configRoute":"/add-ons/rms"},{"id":"zendesk","name":"Zendesk","img_class":"zendesk","data_logo":"Zendesk","configRoute":"/add-ons/zendesk"},{"id":"box","name":"Box","img_class":"box","data_logo":"Box","configRoute":"/add-ons/box","callback":"https://sso.services.box.net/sp/ACS.saml2"},{"id":"echosign","name":"EchoSign","img_class":"echosign","data_logo":"AdobeEchoSign","configRoute":"/add-ons/echosign"},{"id":"springcm","name":"SpringCM","img_class":"springcm","data_logo":"SpringCM","configRoute":"/add-ons/springcm"},{"id":"newrelic","name":"New Relic","img_class":"newrelic","data_logo":"NewRelic","configRoute":"/add-ons/newrelic"},{"id":"egnyte","name":"Egnyte","img_class":"egnyte","data_logo":"Egnyte","configRoute":"/add-ons/egnyte"},{"id":"cloudbees","name":"CloudBees","img_class":"cloudbees","data_logo":"CloudBees","configRoute":"/add-ons/cloudbees","callback":"https://grandcentral.cloudbees.com/authenticate/saml/consume"},{"id":"mscrm","name":"Dynamics CRM","img_class":"mscrm","data_logo":"MicrosoftDynamicsCRM","configRoute":"/add-ons/mscrm"},{"id":"office365","name":"Office 365 (beta)","img_class":"office365","data_logo":"Office365","configRoute":"/add-ons/office365"},{"id":"zoom","name":"Zoom","img_class":"zoom","data_logo":"Zoom","configRoute":"/add-ons/zoom"},{"id":"concur","name":"Concur (beta)","img_class":"concur","data_logo":"Concur","configRoute":"/add-ons/concur","callback":"https://www.concursolutions.com/SAMLRedirector/ClientSAMLLogin.aspx"},{"id":"slack","name":"Slack","img_class":"slack","data_logo":"Slack","configRoute":"/add-ons/slack"}];
      thirdParty.forEach(a => {
        links.push({
          text: a.name,
          type: 'Auth0 (Third Party App)',
          url: 'https://manage.auth0.com/#/externalapps'
        });
      });

      callback();
    },
    (callback) => {
      request(`https://azure.microsoft.com/en-us/documentation/articles/active-directory-saas-tutorial-list/`, (err, res, html) => {
        if (err) {
          return callback(err);
        }

        if (res.statusCode !== 200) {
          return callback(new Error('Unexpected status code: ' + res.statusCode));
        }

        var $ = cheerio.load(html);
        $('div.wa-spacer-docContent table tbody tr a').each((i, element) => {
          var link = $(element);
          links.push({
            text: link.text(),
            type: 'Azure AD',
            url: link.attr('href')
          });
        });

        callback();
      });
    },
    (callback) => {
      request(`https://github.com/okta/UserDocs/tree/master/SAML_Docs`, (err, res, html) => {
        if (err) {
          return callback(err);
        }

        if (res.statusCode !== 200) {
          return callback(new Error('Unexpected status code: ' + res.statusCode));
        }

        var $ = cheerio.load(html);
        $('div.repository-content tr.js-navigation-item a').each((i, element) => {
          var link = $(element);
          if (link.attr('href').indexOf('.html') >= 0
            && (link.attr('href').indexOf('How-to-') >= 0 || link.attr('href').indexOf('Configuring-SAML-') >= 0)) {
            links.push({
              text: link.text()
                .replace('How-to-Enable-SAML-2.0-in-', '')
                .replace('How-to-Configure-SAML-for-', '')
                .replace('How-To-Configure-SAML-1.1-for-', '')
                .replace('How-To-Configure-SAML-2.0-for-', '')
                .replace('How-to-Configure-SAML-1.1-for-', '')
                .replace('How-to-Configure-SAML-2.0-for-', '')
                .replace('How-to-configure-SAML-2.0-for-', '')
                .replace('Configure-SAML-1.1-in-', '')
                .replace('Configure-SAML-2.0-in-', '')
                .replace('Configuring-SAML-2.0-in-', '')
                .replace('Configuring SAML SSO for', '')
                .replace('Configure-CustomSSO-for-', '')
                .replace('Configuring SAML SSO for', '')
                .replace('How-to-', '')
                .replace('-', ' ')
                .replace('.html', ''),
              type: 'Okta',
              url: '?okta=' + link.attr('href')
            });
          }
        });

        callback();
      });
    },
    (callback) => {
      async.each([1, 2, 3, 4], (index, cb) => {
        request(`https://onelogin.zendesk.com/hc/en-us/sections/200245384-Application-Integration-SAML-?page=${index}#articles`, (err, res, html) => {
          if (err) {
            return cb(err);
          }

          if (res.statusCode !== 200) {
            return cb(new Error('Unexpected status code: ' + res.statusCode));
          }

          var $ = cheerio.load(html);
          $('ul.article-list li a').each((i, element) => {
            var link = $(element);
            links.push({
              text: link.text().replace('Configuring SAML for ', ''),
              type: 'OneLogin',
              url: 'https://onelogin.zendesk.com' + link.attr('href')
            });
          });

          cb();
        });
      }, (err) => {
        return callback(err);
      });
  }], (err, context) => {
    done(err, _.sortBy(links, 'text'));
  });
};
