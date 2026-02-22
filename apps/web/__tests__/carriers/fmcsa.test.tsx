import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

import { FmcsaLookup } from "@/components/carriers/fmcsa-lookup";
import { CsaScoresDisplay } from "@/components/carriers/csa-scores-display";

// ===================== INTEG-001: FMCSA Lookup =====================

describe("INTEG-001: FmcsaLookup", () => {
    it("renders FMCSA Verification card with search input", () => {
        render(<FmcsaLookup />);
        expect(screen.getByText("FMCSA Verification")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter MC number")).toBeInTheDocument();
        expect(screen.getByText("Verify")).toBeInTheDocument();
    });

    it("renders MC/DOT toggle buttons", () => {
        render(<FmcsaLookup />);
        expect(screen.getByText("MC#")).toBeInTheDocument();
        expect(screen.getByText("DOT#")).toBeInTheDocument();
    });

    it("switches placeholder on DOT toggle", async () => {
        const user = userEvent.setup();
        render(<FmcsaLookup />);
        await user.click(screen.getByText("DOT#"));
        expect(screen.getByPlaceholderText("Enter DOT number")).toBeInTheDocument();
    });

    it("disables verify when input empty", () => {
        render(<FmcsaLookup />);
        const verifyButton = screen.getByText("Verify").closest("button");
        expect(verifyButton).toBeDisabled();
    });

    it("enables verify when input has value", async () => {
        const user = userEvent.setup();
        render(<FmcsaLookup />);
        await user.type(screen.getByPlaceholderText("Enter MC number"), "MC123456");
        const verifyButton = screen.getByText("Verify").closest("button");
        expect(verifyButton).not.toBeDisabled();
    });

    it("accepts onAutoFill callback prop", () => {
        const onAutoFill = jest.fn();
        render(<FmcsaLookup onAutoFill={onAutoFill} />);
        // Component renders without error when callback is provided
        expect(screen.getByText("FMCSA Verification")).toBeInTheDocument();
    });
});

// ===================== INTEG-001: CSA Scores Display =====================

describe("INTEG-001: CsaScoresDisplay", () => {
    it("renders the CSA component", () => {
        // CsaScoresDisplay takes carrierId and calls useCsaScores internally
        // With the mock returning isLoading: true by default, it shows a loader
        const { container } = render(<CsaScoresDisplay carrierId="c1" />);
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });
});
