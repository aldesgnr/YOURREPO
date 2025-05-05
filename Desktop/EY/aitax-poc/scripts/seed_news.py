#!/usr/bin/env python3
"""
Seed script for populating the database with initial tax news items.
"""

import sys
import os
from datetime import datetime, timedelta
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent.parent / "apps" / "backend"))

from sqlmodel import Session, select
from app.core.database import engine
from app.models.news import News, TaxCategory


def seed_news():
    """Seed the database with initial tax news items"""
    print("Seeding news data...")
    
    # Sample news data
    news_items = [
        {
            "title": "Reduced CIT Rate Extended for SMEs in 2026",
            "content": """
            The Ministry of Finance has announced an extension of the reduced 9% Corporate Income Tax (CIT) rate for small and medium-sized enterprises (SMEs) through the 2026 fiscal year. This extension is part of a broader economic stimulus package aimed at supporting business recovery and growth.

            To qualify for the reduced rate, companies must meet the following criteria:
            - Annual revenue below PLN 2 million (including VAT)
            - Maintain status as a "small taxpayer" as defined in the CIT Act
            - Not be part of a tax capital group

            The extension provides tax certainty for eligible businesses and is expected to benefit approximately 200,000 companies across Poland. The standard CIT rate remains at 19% for larger enterprises.

            The Ministry estimates that this measure will reduce budget revenues by approximately PLN 400 million annually but expects this to be offset by increased economic activity and job creation.
            """,
            "summary": "The 9% CIT rate for small businesses has been extended through 2026, providing tax relief for companies with annual revenue under PLN 2 million.",
            "category": TaxCategory.CIT,
            "source_url": "https://www.gov.pl/web/finance/tax-updates",
            "published_date": datetime.utcnow() - timedelta(days=2)
        },
        {
            "title": "New VAT Reporting Requirements for E-commerce Platforms",
            "content": """
            The Polish Ministry of Finance has introduced new VAT reporting requirements for e-commerce platforms operating in Poland, effective January 1, 2026. These changes align with EU-wide efforts to combat VAT fraud in the digital economy.

            Key changes include:
            1. Quarterly reporting of all transactions facilitated through the platform, regardless of the seller's location
            2. Mandatory verification of seller VAT registration status
            3. Joint liability for unpaid VAT in cases where platforms fail to perform adequate seller verification

            The new regulations apply to all digital platforms facilitating sales of goods or services to Polish consumers, including foreign entities without a physical presence in Poland. Platforms must register in the VAT-OSS (One Stop Shop) system or appoint a fiscal representative in Poland.

            Non-compliance penalties can reach up to 20% of unreported transaction values, with a minimum fine of PLN 50,000 for serious violations.

            The Ministry has announced a six-month transition period with reduced penalties for platforms demonstrating good-faith compliance efforts.
            """,
            "summary": "E-commerce platforms must comply with new VAT reporting requirements starting January 2026, including quarterly transaction reporting and seller verification.",
            "category": TaxCategory.VAT,
            "source_url": "https://www.gov.pl/web/finance/vat-ecommerce",
            "published_date": datetime.utcnow() - timedelta(days=5)
        },
        {
            "title": "Transfer Pricing Documentation Thresholds Updated",
            "content": """
            The Ministry of Finance has updated the thresholds for mandatory transfer pricing documentation, effective for transactions conducted from January 1, 2026. The changes aim to reduce compliance burdens for smaller businesses while maintaining oversight of significant related-party transactions.

            The new thresholds are as follows:
            - For tangible asset transactions: PLN 10 million (increased from PLN 2 million)
            - For service transactions: PLN 2 million (increased from PLN 1 million)
            - For financial transactions: PLN 5 million (increased from PLN 2 million)
            - For low value-adding services: PLN 3 million (new category)

            Additionally, the deadline for preparing transfer pricing documentation has been extended from 9 to 12 months after the end of the tax year. The deadline for filing the TPR (Transfer Pricing Reporting) form remains unchanged at 9 months.

            The Ministry estimates that these changes will exempt approximately 30% of previously covered entities from documentation requirements, primarily benefiting small and medium-sized enterprises with limited international operations.

            Entities below the thresholds must still conduct transactions at arm's length but are exempt from preparing formal documentation unless specifically requested by tax authorities.
            """,
            "summary": "Transfer pricing documentation thresholds have been increased for 2026, reducing the compliance burden for many businesses with related-party transactions.",
            "category": TaxCategory.TRANSFER_PRICING,
            "source_url": "https://www.gov.pl/web/finance/transfer-pricing",
            "published_date": datetime.utcnow() - timedelta(days=7)
        }
    ]
    
    # Create session and add news items
    with Session(engine) as session:
        # Check if news already exists
        existing_news = session.exec(select(News)).all()
        if existing_news:
            print(f"Database already contains {len(existing_news)} news items. Skipping seed.")
            return
        
        # Add news items
        for item in news_items:
            news = News(**item)
            session.add(news)
        
        session.commit()
        print(f"Successfully added {len(news_items)} news items to the database.")


if __name__ == "__main__":
    seed_news()
