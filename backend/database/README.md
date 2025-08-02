# Sample Pitch Deck Database

This folder contains a sample PostgreSQL dump of the `pitch_deck_db` database used in this project.

## File

- `sample_pitch_decks.sql`: Plain SQL dump of the core data (e.g., users, decks, slides)

## Restore Instructions

To restore locally:

```bash
createdb pitch_deck_db
psql -U postgres -d pitch_deck_db -f sample_pitch_decks.sql
