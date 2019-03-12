/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

class HomeSplash extends React.Component {
  render() {
    return (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">
            <div className="inner">
              <h2 className="projectTitle">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    height="48"
                    src={siteConfig.baseUrl + 'img/WordLogo.svg'}
                  />
                </div>
                <small>{siteConfig.tagline}</small>
              </h2>
              <div className="section promoSection">
                <div className="promoRow">
                  <div className="pluginRowBlock">
                    {/* <Button href="#try">Try It Out</Button>
                    <Button
                      href={
                        siteConfig.baseUrl +
                        'docs/' +
                        this.props.language +
                        '/doc1.html'
                      }
                    >
                      Example Link
                    </Button> */}
                    <Button href={'/docs/getting-started.html'}>
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Index extends React.Component {
  render() {
    let language = this.props.language || 'en';
    const showcase = siteConfig.users
      .filter(user => {
        return user.pinned;
      })
      .map(user => {
        return (
          <a href={user.infoLink}>
            <img src={user.image} title={user.caption} />
          </a>
        );
      });

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Container padding={['bottom', 'top']}>
            <GridBlock
              align="center"
              contents={[
                {
                  content: 'The default options are always secure',
                  image: siteConfig.baseUrl + 'img/padlock.svg',
                  imageAlign: 'top',
                  title: 'Secure',
                },
                {
                  content: 'Written in TypeScript',
                  image: siteConfig.baseUrl + 'img/typescript.svg',
                  imageAlign: 'top',
                  title: 'Type Safe',
                },
                {
                  content: 'You can use just the parts you need',
                  image: siteConfig.baseUrl + 'img/npm.svg',
                  imageAlign: 'top',
                  title: 'Modular',
                },
                {
                  content: 'Always use promises instead of callbacks',
                  image: siteConfig.baseUrl + 'img/promises.svg',
                  imageAlign: 'top',
                  title: 'Promises',
                },
              ]}
              layout="fourColumn"
            />
          </Container>

          {/* <div
            className="productShowcaseSection paddingBottom"
            style={{textAlign: 'center'}}
          >
            <h2>Feature Callout</h2>
            <MarkdownBlock>These are features of this project</MarkdownBlock>
          </div> */}

          {/*<Container padding={['bottom', 'top']} background="light">
            <GridBlock
              contents={[
                {
                  content:
                    '@authentication always makes sure to choose secure defaults, and throw an early exception if you miss out important options like keys for signing cookies.',
                  image: siteConfig.baseUrl + 'img/at.svg',
                  imageAlign: 'right',
                  title: 'Secure',
                },
              ]}
            />
          </Container>

          <Container padding={['bottom', 'top']} id="try">
            <GridBlock
              contents={[
                {
                  content: 'Talk about trying this out',
                  image: siteConfig.baseUrl + 'img/at.svg',
                  imageAlign: 'left',
                  title: 'Try it Out',
                },
              ]}
            />
          </Container> */}

          {/* <div className="productShowcaseSection paddingBottom">
            <h2>{"Who's Using This?"}</h2>
            <p>This project is used by all these people</p>
            <div className="logos">{showcase}</div>
            <div className="more-users">
              <a
                className="button"
                href={
                  siteConfig.baseUrl + this.props.language + '/' + 'users.html'
                }
              >
                More {siteConfig.title} Users
              </a>
            </div>
          </div> */}
        </div>
      </div>
    );
  }
}

module.exports = Index;
