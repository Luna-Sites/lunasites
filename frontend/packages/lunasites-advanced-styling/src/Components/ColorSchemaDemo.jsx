import React from 'react';
import { Card, Header, Button, Grid, Segment } from 'semantic-ui-react';

const ColorSchemaDemo = () => {
  return (
    <div className="color-schema-demo" style={{ padding: '20px' }}>
      <Header as="h2">Color Schema System Demo</Header>

      <Button onClick={testColors} style={{ marginBottom: '20px' }}>
        Test Color Variables (Check Console)
      </Button>

      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h3">CSS Variables in Action</Header>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={4}>
            <Card className="color-schema-card">
              <Card.Content
                style={{
                  backgroundColor: 'var(--lunasites-primary-color)',
                  color: 'white',
                }}
              >
                <Card.Header>Primary Color</Card.Header>
                <Card.Description>
                  Uses --lunasites-primary-color
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>

          <Grid.Column width={4}>
            <Card className="color-schema-card">
              <Card.Content
                style={{
                  backgroundColor: 'var(--lunasites-secondary-color)',
                  color: 'white',
                }}
              >
                <Card.Header>Secondary Color</Card.Header>
                <Card.Description>
                  Uses --lunasites-secondary-color
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>

          <Grid.Column width={4}>
            <Card className="color-schema-card">
              <Card.Content
                style={{
                  backgroundColor: 'var(--lunasites-header-color)',
                  color: 'white',
                }}
              >
                <Card.Header>Header Color</Card.Header>
                <Card.Description>
                  Uses --lunasites-header-color
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>

          <Grid.Column width={4}>
            <Card className="color-schema-card">
              <Card.Content
                style={{
                  backgroundColor: 'var(--lunasites-accent-color)',
                  color: 'white',
                }}
              >
                <Card.Header>Accent Color</Card.Header>
                <Card.Description>
                  Uses --lunasites-accent-color
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h3">Utility Classes</Header>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={4}>
            <Segment className="color-schema-primary-bg color-schema-transition">
              <Header as="h4" style={{ color: 'white' }}>
                .color-schema-primary-bg
              </Header>
              <p style={{ color: 'white' }}>
                Background using primary color utility class
              </p>
            </Segment>
          </Grid.Column>

          <Grid.Column width={4}>
            <Segment className="color-schema-secondary-bg color-schema-transition">
              <Header as="h4" style={{ color: 'white' }}>
                .color-schema-secondary-bg
              </Header>
              <p style={{ color: 'white' }}>
                Background using secondary color utility class
              </p>
            </Segment>
          </Grid.Column>

          <Grid.Column width={4}>
            <Segment
              className="color-schema-bg"
              style={{ border: '2px solid var(--lunasites-primary-color)' }}
            >
              <Header as="h4" className="color-schema-header">
                .color-schema-bg
              </Header>
              <p className="color-schema-text">
                Background and text using utility classes
              </p>
            </Segment>
          </Grid.Column>

          <Grid.Column width={4}>
            <Segment className="color-schema-accent-bg color-schema-transition">
              <Header as="h4" style={{ color: 'white' }}>
                .color-schema-accent-bg
              </Header>
              <p style={{ color: 'white' }}>
                Background using accent color utility class
              </p>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h3">Interactive Elements</Header>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <div style={{ marginBottom: '10px' }}>
              <Button
                style={{
                  backgroundColor: 'var(--lunasites-primary-color)',
                  color: 'white',
                  border: 'none',
                }}
              >
                Primary Button
              </Button>
              <Button
                style={{
                  backgroundColor: 'var(--lunasites-secondary-color)',
                  color: 'white',
                  border: 'none',
                  marginLeft: '10px',
                }}
              >
                Secondary Button
              </Button>
            </div>

            <div>
              <a
                href="#"
                style={{
                  color: 'var(--lunasites-primary-color)',
                  textDecoration: 'none',
                  marginRight: '15px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--lunasites-accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--lunasites-primary-color)';
                }}
              >
                Primary Link
              </a>
              <a
                href="#"
                style={{
                  color: 'var(--lunasites-secondary-color)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--lunasites-accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--lunasites-secondary-color)';
                }}
              >
                Secondary Link
              </a>
            </div>
          </Grid.Column>

          <Grid.Column width={8}>
            <div
              style={{
                backgroundColor: 'var(--lunasites-background-color)',
                color: 'var(--lunasites-text-color)',
                padding: '15px',
                border: '1px solid var(--lunasites-primary-color)',
                borderRadius: '4px',
              }}
            >
              <Header as="h4" className="color-schema-header">
                Dynamic Color Panel
              </Header>
              <p>
                This panel adapts to the current color schema automatically.
                Change the color schema to see it update in real-time.
              </p>
              <Button
                className="use-primary"
                style={{
                  backgroundColor: 'var(--lunasites-accent-color)',
                  color: 'white',
                  border: 'none',
                }}
              >
                Accent Action
              </Button>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Header as="h4">How to Use</Header>
        <ol>
          <li>Open any block's settings panel</li>
          <li>Look for the "Color Schema" widget</li>
          <li>Choose a preset or customize individual colors</li>
          <li>Apply changes and watch this demo update in real-time</li>
          <li>All components using CSS variables will automatically adapt</li>
        </ol>
      </div>
    </div>
  );
};

export default ColorSchemaDemo;
